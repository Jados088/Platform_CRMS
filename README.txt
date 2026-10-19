CRMS - folder structure
  index.php register.php logout.php seed.php dashboard.php   (public entry points)
  includes/app.php   database, auth, layout, helpers
  customer/  dashboard, cars, rent, my (profile/reservations/invoices/payments)
  officer/   dashboard, reservations, agreements, rentals (handover/return/inspections), customers
  cashier/   dashboard, finance (invoices, payments, refunds, deposits)
  manager/   dashboard, reports
  admin/     dashboard, users, vehicles, drivers, maintenance, audit, settings
  shared/    agreement (view/pay/sign), receipt
  assets/style.css   uploads/ (must be writable)
Rental agreements support drawn renter and staff signatures. Once both parties sign, customers and authorized staff can download the completed agreement as a PDF from the agreement page; staff can also access it from the customer and agreements lists.
In-app notifications alert rental officers to new customer registrations and rental requests, cashiers to payment and deposit submissions, and customers and staff to reservation, payment, agreement, pickup, and return updates. Use the bell in the top bar to view and manage notifications.
SETUP (XAMPP): import carrental.sql; copy folder to htdocs/crms; edit DBC in includes/app.php;
open /crms/seed.php once then delete it; sign in at /crms/ (demo password Pass@12345).
