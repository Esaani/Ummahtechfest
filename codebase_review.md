# Comprehensive Codebase Review & Logic Analysis

This document outlines the identified flaws, logic gaps, and potential breaking points in the Ummah Tech Fest codebase as of June 2026.

## 1. Critical Logic Flaws & Race Conditions

### 1.1 Payment Verification Race Conditions
**Location:** `apps/payments/views.py` -> `VerifyPaymentView`
**Issue:** The verification flow checks `payment.status == PaymentStatus.SUCCESS` before calling the provider's verify method. However, there is no explicit database-level locking (`select_for_update()`).
**How it breaks:** If a user clicks "Verify" multiple times simultaneously, or if the webhook arrives at the exact same moment, `mark_payment_success` could be triggered multiple times. If fulfillment logic (e.g., ticket generation) is not perfectly idempotent, this could result in duplicate tickets or corrupted registration states.
**Suggested Fix:** Use `transaction.atomic()` and `Payment.objects.select_for_update().get(reference=reference)` at the start of the verification process.

### 1.2 Idempotency in Payment Fulfillment
**Location:** `apps/payments/services.py` -> `mark_payment_success`
**Issue:** If a payment is already marked as success, re-running the fulfillment logic might trigger side effects (duplicate emails, redundant database writes).
**How it breaks:** Duplicate confirmation emails to users can create confusion and look unprofessional.
**Suggested Fix:** Add an early exit in `mark_payment_success` if the payment is already in `SUCCESS` status.

### 1.3 OTP Validation Bypass Risk
**Location:** `apps/accounts/views.py` -> `RegisterView`
**Issue:** The `RegisterView` likely relies on a `signup_token` issued after OTP verification. 
**How it breaks:** If the registration endpoint doesn't strictly validate that the `email` in the registration payload matches the `email` for which the `signup_token` was issued, a malicious user could verify one email and register another.
**Suggested Fix:** Ensure the `RegisterSerializer` validates the signup token against the specific email and purpose.

---

## 2. Security & Permission Risks

### 2.1 Media Asset Privacy Gaps
**Location:** `apps/cms/models.py` -> `MediaAsset`
**Issue:** All media assets (including Speaker CVs, Volunteer CVs, and Profile Photos) are stored in a predictable folder/filename structure. There is no access control logic to prevent unauthorized viewing if a URL is discovered or guessed.
**How it breaks:** Potential leak of personally identifiable information (PII) if private documents are indexed or shared accidentally.
**Suggested Fix:** Implement a "private" media flag and a proxy view for serving sensitive assets that checks for admin permissions or the owner's session.

### 2.2 Soft Deletion Email Collisions
**Location:** `apps/accounts/models.py` -> `User.delete`
**Issue:** Appending `+deleted.{id}` to the email allows re-registration.
**How it breaks:** If a user is semi-deleted (e.g., their profile exists but `is_deleted=True`), logic that looks up users by email might find multiple records if not filtered by `is_deleted=False`.
**Suggested Fix:** Ensure all auth lookup queries include `.filter(is_active=True, is_deleted=False)`.

---

## 3. Performance Bottlenecks

### 3.1 Heavy Admin Dashboard Aggregations
**Location:** `apps/registrations/views.py` -> `AdminDashboardStatsView`
**Issue:** This view performs multiple heavy aggregations (`Count`, `Sum`) across several apps (registrations, speakers, volunteers, payments) on every request.
**How it breaks:** As the database grows to thousands of records, this page will become increasingly slow, potentially timing out and frustrating administrators.
**Suggested Fix:** Implement caching (similar to the new finance overview cache) or use a daily scheduled task to compute these stats and store them in a `DashboardStats` model.

### 3.2 N+1 Query Potential in List Views
**Location:** Various `AdminListCreateView` classes.
**Issue:** While some views use `select_related`, many admin views fetch related objects (like `uploaded_by` or `user`) without pre-fetching.
**How it breaks:** Loading an admin list with 100 items could trigger 101 database queries, significantly increasing server response time.
**Suggested Fix:** Audit all admin list views and ensure `select_related` and `prefetch_related` are used according to the "Performance & Query Optimization Rules".

---

## 4. Reliability & Maintainability

### 4.1 Synchronous Background Tasks Dependency
**Location:** `common/email_service.py` -> `send_templated_email`
**Issue:** Critical communications (OTP, payment confirmation) rely on Celery tasks. 
**How it breaks:** If the Redis message broker or Celery worker goes down, users will not receive OTPs or payment confirmations, effectively breaking the platform's core loops.
**Suggested Fix:** Implement a fallback logging mechanism or a "failed tasks" dashboard in the admin portal to monitor and retry failed emails.

### 4.2 Hardcoded Pass Prices in Settings
**Location:** `apps/registrations/models.py` -> `PassType.price_ghs`
**Issue:** Prices fall back to `PASS_DEFAULT_PRICES_GHS` in settings.
**How it breaks:** Changing settings will retroactively "change" the listed price for historical registrations that didn't have a specific price set.
**Suggested Fix:** Always snapshot the current price into the `PassRegistration` model upon creation to ensure historical integrity.

---

## 5. Summary & Next Steps

### Priorities:
1. **Critical**: Implement atomic locking in `VerifyPaymentView`.
2. **High**: Secure `MediaAsset` access for PII (CVs).
3. **Medium**: Cache `AdminDashboardStatsView`.
4. **Consistency**: Audit all admin views for N+1 queries.

### Proposed Workflow:
1. Align on the priority of these fixes.
2. Implement fixes app-by-app, starting with **Payments** and **Accounts**.
3. Add regression tests to verify race condition fixes (using `unittest.mock` or concurrent request simulations).
