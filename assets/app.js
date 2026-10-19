(function () {
  'use strict';

  var wrap = document.getElementById('wrap');
  var toggle = document.getElementById('tg');

  if (wrap && toggle) {
    try {
      if (localStorage.getItem('sc') === '1') wrap.classList.add('sc');
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }

    toggle.addEventListener('click', function () {
      wrap.classList.toggle('sc');
      wrap.classList.toggle('so');
      toggle.setAttribute('aria-expanded', wrap.classList.contains('so') ? 'true' : 'false');
      try {
        localStorage.setItem('sc', wrap.classList.contains('sc') ? '1' : '0');
      } catch (error) {
        if (!(error instanceof DOMException)) throw error;
      }
    });
  }

  var showNotificationActionError = function (message) {
    var content = document.querySelector('.content');
    if (!content) {
      window.alert(message);
      return;
    }
    var alert = document.createElement('div');
    alert.className = 'alert alert-danger notification-action-error';
    alert.setAttribute('role', 'alert');
    alert.textContent = message;
    content.prepend(alert);
  };

  var updateNotificationCount = function (count) {
    var trigger = document.getElementById('notificationMenu');
    var badge = document.getElementById('notificationUnreadBadge');
    var summary = document.getElementById('notificationUnreadSummary');
    if (trigger) trigger.classList.toggle('has-unread', count > 0);
    if (count > 0) {
      if (!badge && trigger) {
        badge = document.createElement('span');
        badge.id = 'notificationUnreadBadge';
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger';
        trigger.appendChild(badge);
      }
      if (badge) badge.textContent = count > 99 ? '99+' : String(count);
      if (summary) summary.textContent = count + ' unread';
    } else {
      if (badge) badge.remove();
      if (summary) summary.remove();
    }
    if (trigger) trigger.setAttribute('aria-label', 'Notifications, ' + count + ' unread');
  };

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-notification-form]')) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (typeof window.fetch !== 'function') {
      form.submit();
      return;
    }

    window.fetch(form.action, {
      method: 'POST',
      headers: {'X-Requested-With': 'XMLHttpRequest'},
      body: new FormData(form),
      credentials: 'same-origin'
    }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message || 'Could not update this notification.');
        }
        return payload;
      });
    }).then(function (payload) {
      var row = form.closest('.notification-row');
      var item = form.querySelector('.notification-item');
      if (row) row.classList.remove('unread');
      if (item) item.classList.remove('unread');
      if (row) {
        var markReadForm = row.querySelector('form:not([data-notification-form])');
        if (markReadForm) markReadForm.remove();
      }
      updateNotificationCount(Number(payload.unread_count));
      if (payload.destination) {
        window.location.assign(payload.destination);
      } else if (submitButton) {
        submitButton.disabled = false;
      }
    }).catch(function (error) {
      showNotificationActionError(error.message || 'Could not update this notification. Please try again.');
      if (submitButton) submitButton.disabled = false;
    });
  }, true);

  document.querySelectorAll('input[type="password"]').forEach(function (input) {
    var group = document.createElement('div');
    group.className = 'input-group password-field';
    input.parentNode.insertBefore(group, input);
    group.appendChild(input);

    var button = document.createElement('button');
    button.className = 'btn btn-outline-secondary password-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Show password');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<i class="bi bi-eye" aria-hidden="true"></i>';
    group.appendChild(button);

    button.addEventListener('click', function () {
      var visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
      button.setAttribute('aria-pressed', visible ? 'true' : 'false');
      button.innerHTML = '<i class="bi bi-eye' + (visible ? '-slash' : '') + '" aria-hidden="true"></i>';
    });
  });

  var rentalForm = document.querySelector('[data-rental-dates]');
  if (rentalForm) {
    var pickup = rentalForm.querySelector('[name="pickup_datetime"]');
    var returned = rentalForm.querySelector('[name="return_datetime"]');

    if (pickup && returned) {
      var localDateTime = function (date) {
        var offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
      };

      var updateRentalDates = function () {
        var now = new Date();
        pickup.min = localDateTime(now);
        var pickupDate = new Date(pickup.value);
        var returnDate = new Date(returned.value);
        var earliestPickup = pickup.value && !isNaN(pickupDate.getTime())
          ? pickupDate
          : new Date(now.getTime() + 60000);
        returned.min = localDateTime(new Date(earliestPickup.getTime() + 7 * 60 * 60 * 1000));
        pickup.setCustomValidity(pickup.value && pickupDate <= now
          ? 'Pickup must be in the future.'
          : '');
        var returnError = '';
        if (returned.value && pickup.value && returnDate <= pickupDate) {
          returnError = 'Return must be after pickup.';
        } else if (returned.value && pickup.value && returnDate - pickupDate < 7 * 60 * 60 * 1000) {
          returnError = 'The rental period must be at least 7 hours.';
        }
        returned.setCustomValidity(returnError);
      };

      [pickup, returned].forEach(function (input) {
        input.addEventListener('input', updateRentalDates);
        input.addEventListener('change', updateRentalDates);
      });
      updateRentalDates();
    }
  }

  document.addEventListener('click', function (event) {
    var action = event.target.closest('[data-confirm]');
    if (!action) return;

    if (!window.confirm(action.getAttribute('data-confirm'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    action.dataset.confirmed = '1';
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    var submitter = event.submitter;
    var confirmedAction = submitter && submitter.hasAttribute('data-confirm') ? submitter : form;
    if (confirmedAction.hasAttribute('data-confirm') && confirmedAction.dataset.confirmed !== '1') {
      if (!window.confirm(confirmedAction.getAttribute('data-confirm'))) {
        event.preventDefault();
        return;
      }
    }
    delete confirmedAction.dataset.confirmed;

    if (form.dataset.submitting === '1') {
      event.preventDefault();
      return;
    }
    form.dataset.submitting = '1';

    if (submitter && submitter.tagName === 'BUTTON' && !submitter.hasAttribute('data-no-loading')) {
      submitter.setAttribute('aria-busy', 'true');
      submitter.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing…';
    }
  });
}());
