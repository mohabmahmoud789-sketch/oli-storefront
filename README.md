# OLI storefront

This is a dependency-free static storefront. Open `index.html` locally or deploy the `outputs` directory to any static host.

## Included

- Responsive editorial homepage and product details
- EGP 500 single-product bag with quantity controls and `localStorage` persistence
- EGP 50 shipping fee added to checkout and the saved COD order total
- Cash-on-delivery checkout form with browser-side validation
- Order summary and confirmation; online payment is never claimed or attempted
- Page metadata and social links to OLI's Instagram account

## Before taking real orders

This build has no connected order service. Submitting checkout stores an unpaid COD order in that browser's `localStorage`; it does not notify OLI or create an order in a merchant system. Connect the checkout submit handler in `app.js` to a secured order API and configure fulfilment before accepting live purchases. The order object already identifies the payment method as `cash_on_delivery` and status as `unpaid` so a future API can preserve that boundary.

The Instagram profile could not be read in this environment. The product page uses the product photo supplied in this conversation; replace the stock lifestyle images with approved OLI campaign photography when available. The OLI wordmark here is typeset text, not a reproduced logo asset. No testimonials or product certifications are fabricated.
