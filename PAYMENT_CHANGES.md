# Razorpay Payment Disabled - Manual Payment Collection Implementation

## Summary

Razorpay payment gateway has been disabled as the account is not yet active. The booking system now uses a manual payment collection workflow where:

1. **User submits booking** → Booking is created with PENDING status
2. **System sends emails** → Admin receives payment collection request, customer receives confirmation
3. **Admin contacts user** → Admin manually collects payment via phone/email
4. **Admin confirms booking** → Admin updates booking status in the system

## Changes Made

### 1. Email System (`lib/email.ts`)
**New Functions Added:**
- `sendAdminPendingPaymentEmail()` - Sends detailed booking info to admin with prominent "Amount to Collect" and customer contact details
- `sendCustomerPendingPaymentEmail()` - Informs customer that admin will contact them soon for payment

**Email Features:**
- Admin email includes:
  - Customer contact details (name, email, phone)
  - Booking details (package, dates, travelers, rooms)
  - Room selection breakdown (if applicable)
  - Special requests
  - Total amount to collect with price breakdown
  - Quick action buttons (Call, Email, View in Admin)
  
- Customer email includes:
  - Booking reference number
  - Trip details with pending confirmation status
  - Notice that admin will contact them
  - Total amount payable

### 2. Checkout Page (`app/checkout/page.tsx`)
**Changes:**
- Removed entire Razorpay payment flow (script loading, payment order creation, payment gateway opening)
- Simplified `handleSubmit()` to just create booking and redirect to success page
- Updated UI messaging:
  - Changed "Secure Payment" notice to "Payment Collection" notice
  - Changed button text from "Pay ₹X" to "Submit Booking Request"
  - Changed submitting state text to "Submitting Booking..."
  - Updated info box color from green (secure payment) to blue (payment collection)

### 3. Booking Creation API (`app/api/bookings/route.ts`)
**Changes:**
- Added email import: `sendAdminPendingPaymentEmail`, `sendCustomerPendingPaymentEmail`
- After booking creation, sends both emails:
  - Admin receives pending payment notification
  - Customer receives pending confirmation notification
- Email sending is wrapped in try-catch to not fail booking if emails fail
- Bookings still created with `PENDING` status and `UNPAID` payment status (this was already the case)

### 4. Success Page (`app/checkout/success/page.tsx`)
**Changes:**
- Added `isPending` flag detection from URL query parameter (`?pending=true`)
- Conditional rendering based on `isPending`:
  - **Pending bookings:**
    - Yellow theme (icon, badges)
    - "Booking Received!" heading
    - "Payment Pending" status badge
    - "Total Amount" instead of "Total Paid"
    - Yellow notice box explaining admin will contact them
  - **Confirmed bookings:**
    - Green theme (icon, badges)
    - "Booking Confirmed!" heading
    - Payment status badge
    - "Total Paid"
    - Blue confirmation email notice

### 5. Profile Page (`app/profile/page.tsx`)
**Changes:**
- **Removed** "Pay Now" button that opened Razorpay for unpaid bookings
- **Removed** `handleRetryPayment()` function and all Razorpay payment logic
- **Removed** unused RTK Query mutations: `useCreatePaymentOrderMutation`, `useVerifyPaymentMutation`
- **Removed** unused state: `processingPaymentId`
- **Removed** Razorpay script tag: `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`
- **Removed** unused import: `Script` from `next/script`
- **Added** yellow info box for unpaid bookings: "Our team will contact you soon to collect payment"
- Users can still view booking details and write reviews for completed trips

## Files Modified

1. `lib/email.ts` - Added 2 new email functions (441 lines added)
2. `app/checkout/page.tsx` - Removed Razorpay flow, simplified booking creation
3. `app/api/bookings/route.ts` - Added email notifications after booking creation
4. `app/checkout/success/page.tsx` - Added pending payment state handling
5. `app/profile/page.tsx` - Removed Pay Now button and Razorpay functionality

## Admin Workflow

When a booking is made:

1. **Admin receives email** with subject: "💰 PAYMENT PENDING: [Package Name] - ₹[Amount] | Ref: [Booking Ref]"
2. **Email contains:**
   - Prominent alert: "Customer booking created - Please contact to collect payment"
   - Booking reference number
   - Customer contact details with clickable phone and email
   - Complete booking details
   - Amount to collect with breakdown
   - Call to action buttons

3. **Admin should:**
   - Contact customer via phone or email
   - Collect payment details
   - Update booking status in admin panel to "CONFIRMED"
   - Update payment status to "PAID"

## Customer Experience

1. User completes checkout form
2. Clicks "Submit Booking Request" button
3. Booking is created immediately
4. Redirected to success page with pending payment message
5. Receives email confirmation with booking details
6. Email explains admin will contact them
7. Admin contacts them to collect payment
8. Booking is confirmed after payment

## Re-enabling Razorpay (Future)

When Razorpay account becomes active, to re-enable online payments:

1. **In `app/checkout/page.tsx`:**
   - Restore the `loadRazorpayScript()` function call
   - Restore the payment order creation: `createPaymentOrder()`
   - Restore the Razorpay options and `razorpay.open()`
   - Change redirect to: `router.push(\`/checkout/success?ref=\${booking.bookingRef}\`)`

2. **In `app/api/bookings/route.ts`:**
   - Replace `sendAdminPendingPaymentEmail()` with a comment or remove the function call
   - Replace `sendCustomerPendingPaymentEmail()` with a comment or remove the function call
   - Emails will be sent from `app/api/payment/verify/route.ts` after successful payment

3. **In `app/checkout/page.tsx` (UI):**
   - Revert the notice box back to green "Secure Payment" theme
   - Revert button text back to "Pay ₹{amount}"

## Environment Variables Used

- `ADMIN_EMAIL` - Email address where admin notifications are sent (falls back to `EMAIL_ID`)
- `EMAIL_ID` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app password for nodemailer
- `NEXTAUTH_URL` - Base URL for links in emails

## Testing Checklist

- [x] Booking creation works without Razorpay
- [x] Admin receives pending payment email
- [x] Customer receives pending confirmation email
- [x] Success page shows pending payment state
- [x] Email templates include all booking details
- [x] Email templates include room selection if applicable
- [x] Booking reference is generated correctly
- [x] Total price calculation includes rooms and discounts

## Notes

- Bookings are still recorded in the database with PENDING/UNPAID status
- Room availability is still decremented on booking creation
- Seats are still decremented on booking creation
- Coupon validation and application still works
- All booking validations (seats, rooms) still occur
