# RTK Query Migration Guide

This document outlines the RTK Query migration progress for the Bookmundi project.

## Completed API Slices

The following API slices have been created/updated in `lib/api/`:

1. **apiSlice.ts** - Base API configuration with all tag types
2. **adminApi.ts** - Comprehensive admin endpoints for:
   - Stats, Reviews, Bookings, Users, Destinations, Packages
   - Enquiries, Contacts, Newsletter, Experts, Sales
   - Feature Boxes, Settings, Upload Signature

3. **userApi.ts** - User-related endpoints:
   - Profile, Bookings, Reviews, Coupons, Payments

4. **packagesApi.ts** - Package endpoints with filters:
   - Get packages with filters, budget stats, tour type stats

5. **destinationsApi.ts** - Destination endpoints:
   - Get destinations with groupByRegion support

6. **reviewsApi.ts** - Review endpoints:
   - Get reviews, video reviews, photo reviews

7. **publicApi.ts** - Public endpoints:
   - Sales, Feature Boxes, Experts, Enquiry, Brochure, Trip Planner

## Pages/Components Already Converted

### Admin Pages
- [x] `app/admin/page.tsx` - Uses useGetAdminStatsQuery
- [x] `app/admin/reviews/page.tsx` - Uses useGetAdminReviewsQuery, useUpdateAdminReviewMutation, useDeleteAdminReviewMutation
- [x] `app/admin/bookings/page.tsx` - Uses useGetAdminBookingsQuery, useUpdateAdminBookingMutation, useDeleteAdminBookingMutation
- [x] `app/admin/destinations/page.tsx` - Uses useGetAdminDestinationsQuery, useCreateAdminDestinationMutation, useUpdateAdminDestinationMutation, useDeleteAdminDestinationMutation

### Public Pages
- [x] `app/review/page.tsx` - Uses useGetPackageQuery, useCreateReviewMutation
- [x] `app/profile/page.tsx` - Uses useGetUserProfileQuery, useUpdateUserProfileMutation, useGetUserBookingsQuery, useCreatePaymentOrderMutation, useVerifyPaymentMutation

### Components
- [x] `components/hero.tsx` - Uses useGetDestinationsQuery
- [x] `components/video-testimonials-section.tsx` - Uses useGetVideoReviewsQuery
- [x] `components/travelers-photos.tsx` - Uses useGetPhotoReviewsQuery
- [x] `components/top-rated.tsx` - Uses useGetPackagesQuery
- [x] `components/best-tours.tsx` - Uses useGetPackagesQuery with filters

## Files Still Needing Conversion

### Admin Pages (Priority: High)
- [ ] `app/admin/page.tsx` - Dashboard stats
- [ ] `app/admin/packages/page.tsx` - Package listing
- [ ] `app/admin/packages/create/page.tsx` - Package creation
- [ ] `app/admin/packages/[id]/edit/page.tsx` - Package editing
- [ ] `app/admin/users/page.tsx` - User management
- [ ] `app/admin/enquiries/page.tsx` - Enquiry management
- [ ] `app/admin/contact/page.tsx` - Contact messages
- [ ] `app/admin/newsletter/page.tsx` - Newsletter management
- [ ] `app/admin/experts/page.tsx` - Expert management
- [ ] `app/admin/sales/page.tsx` - Sales management
- [ ] `app/admin/sales/create/page.tsx` - Sale creation
- [ ] `app/admin/sales/[id]/page.tsx` - Sale editing
- [ ] `app/admin/homepage/page.tsx` - Homepage customization
- [ ] `app/admin/reviews/create/page.tsx` - Review creation

### Public Pages (Priority: High)
- [ ] `app/profile/page.tsx` - User profile
- [ ] `app/profile/bookings/[ref]/page.tsx` - Booking details
- [ ] `app/checkout/page.tsx` - Checkout flow
- [ ] `app/checkout/success/page.tsx` - Checkout success
- [ ] `app/trip-planner/page.tsx` - Trip planner
- [ ] `app/tours/page.tsx` - Tours listing
- [ ] `app/destinations/page.tsx` - Destinations listing
- [ ] `app/destinations/trip/[id]/page.tsx` - Trip detail page

### Components (Priority: Medium)
- [ ] `components/group-tours.tsx` - Tour categories
- [ ] `components/tours-by-budget.tsx` - Budget-based tours
- [ ] `components/top-activities.tsx` - Top activities
- [ ] `components/tailored-tours.tsx` - Customized tours
- [ ] `components/customize-trip.tsx` - Trip customization
- [ ] `components/EnquiryForm.tsx` - Enquiry form
- [ ] `components/EnquiryDialog.tsx` - Enquiry dialog
- [ ] `components/BrochureDialog.tsx` - Brochure dialog
- [ ] `components/admin/cloudinary-upload.tsx` - Upload component

## How to Convert a File

1. Import the relevant RTK Query hooks from the API slice
2. Replace `useState` + `useEffect` + `fetch` pattern with RTK Query hook
3. Replace mutation functions (POST/PUT/DELETE) with RTK Query mutations
4. Update loading/error states to use query hook states
5. Remove manual fetch functions and refetch logic

### Example Conversion

**Before:**
```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch("/api/endpoint")
        .then(res => res.json())
        .then(setData)
        .finally(() => setLoading(false));
}, []);
```

**After:**
```tsx
const { data = [], isLoading: loading } = useGetDataQuery();
```

## Available Hooks

### Admin Hooks (from `@/lib/api/adminApi`)
- `useGetAdminStatsQuery`
- `useGetAdminReviewsQuery`, `useCreateAdminReviewMutation`, `useUpdateAdminReviewMutation`, `useDeleteAdminReviewMutation`
- `useGetAdminBookingsQuery`, `useUpdateAdminBookingMutation`, `useDeleteAdminBookingMutation`
- `useGetAdminUsersQuery`, `useUpdateAdminUserMutation`, `useDeleteAdminUserMutation`
- `useGetAdminDestinationsQuery`, `useCreateAdminDestinationMutation`, `useUpdateAdminDestinationMutation`, `useDeleteAdminDestinationMutation`
- `useGetAdminPackagesQuery`, `useCreateAdminPackageMutation`, `useUpdateAdminPackageMutation`, `useDeleteAdminPackageMutation`
- `useGetAdminEnquiriesQuery`, `useUpdateAdminEnquiryMutation`, `useDeleteAdminEnquiryMutation`
- `useGetAdminContactsQuery`, `useUpdateAdminContactMutation`, `useDeleteAdminContactMutation`
- `useGetAdminNewsletterQuery`, `useDeleteAdminNewsletterMutation`
- `useGetAdminExpertsQuery`, `useCreateAdminExpertMutation`, `useUpdateAdminExpertMutation`, `useDeleteAdminExpertMutation`
- `useGetAdminSalesQuery`, `useCreateAdminSaleMutation`, `useUpdateAdminSaleMutation`, `useDeleteAdminSaleMutation`
- `useGetAdminFeatureBoxesQuery`, `useCreateAdminFeatureBoxMutation`, `useUpdateAdminFeatureBoxMutation`, `useDeleteAdminFeatureBoxMutation`
- `useCheckAdminAccessQuery`
- `useGetUploadSignatureMutation`

### User Hooks (from `@/lib/api/userApi`)
- `useGetUserProfileQuery`, `useUpdateUserProfileMutation`
- `useGetUserBookingsQuery`, `useGetBookingByRefQuery`
- `useCreateBookingMutation`
- `useApplyCouponMutation`
- `useCreateReviewMutation`
- `useCreatePaymentOrderMutation`, `useVerifyPaymentMutation`

### Package Hooks (from `@/lib/api/packagesApi`)
- `useGetPackagesQuery`, `useGetPackageQuery`, `useGetPackagesByDestinationQuery`
- `useCreatePackageMutation`, `useUpdatePackageMutation`, `useDeletePackageMutation`
- `useGetBudgetStatsQuery`, `useGetTourTypeStatsQuery`, `useGetPackageFiltersQuery`

### Destination Hooks (from `@/lib/api/destinationsApi`)
- `useGetDestinationsQuery`, `useGetDestinationsByRegionQuery`, `useGetDestinationQuery`
- `useCreateDestinationMutation`, `useUpdateDestinationMutation`, `useDeleteDestinationMutation`

### Review Hooks (from `@/lib/api/reviewsApi`)
- `useGetReviewsQuery`, `useGetVideoReviewsQuery`, `useGetPhotoReviewsQuery`, `useGetReviewQuery`
- `useCreateReviewMutation`

### Public Hooks (from `@/lib/api/publicApi`)
- `useGetActiveSalesQuery`, `useGetSaleBySlugQuery`
- `useGetFeatureBoxesQuery`
- `useGetExpertsQuery`
- `useSubmitEnquiryMutation`
- `useRequestBrochureMutation`
- `useSubmitTripPlanMutation`
