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
In-app notifications alert rental officers to new customer registrations and rental requests, cashiers to payment and deposit submissions, and business managers to staff management alerts. Unread alerts are highlighted. Opening an alert marks it read; alerts that link to a page outside the user's role are marked read without navigating away. Empty data tables show a clear no-records message instead of only column headings.
Rental applications require a company driver and a rental period of at least 7 hours. Customers cannot self-drive; the form does not request the renter's driving-licence or date-of-birth details. New rental invoices and return charges do not add VAT.
SETUP (XAMPP): import carrental.sql; copy folder to htdocs/crms; edit DBC in includes/app.php;

