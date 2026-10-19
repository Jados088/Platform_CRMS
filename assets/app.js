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
    var expiry = rentalForm.querySelector('[name="license_expiry_date"]');

    if (pickup && returned && expiry) {
      var localDateTime = function (date) {
        var offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
      };

      var updateRentalDates = function () {
        var now = new Date();
        pickup.min = localDateTime(now);
        returned.min = pickup.value || localDateTime(new Date(now.getTime() + 60000));

        var pickupDate = new Date(pickup.value);
        var returnDate = new Date(returned.value);
        pickup.setCustomValidity(pickup.value && pickupDate <= now
          ? 'Pickup must be in the future.'
          : '');
        returned.setCustomValidity(returned.value && pickup.value && returnDate <= pickupDate
          ? 'Return must be after pickup.'
          : '');
        expiry.setCustomValidity(expiry.value && returned.value && expiry.value < returned.value.slice(0, 10)
          ? 'Your driving licence must be valid through the return date.'
          : '');
      };

      [pickup, returned, expiry].forEach(function (input) {
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
