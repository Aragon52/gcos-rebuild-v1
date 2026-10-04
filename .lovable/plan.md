# Reseller login and signup readiness flow

## Goal
Make reseller sign-in and registration feel responsive before submission, while keeping the final account action under the customer’s control.

## Changes
- Validate required fields continuously as customers type.
- After all fields are valid and unchanged for two seconds, begin a lightweight connection/readiness check.
- Show rotating animated status text during readiness and during the real account operation.
- Keep the submit button inactive until readiness succeeds, then light it up for the customer to press.
- On sign-in, use messages such as “Securing your connection”, “Checking account access”, and “Preparing your dashboard”.
- On signup, use messages such as “Preparing your shop”, “Loading the product catalog”, “Preparing your dashboard”, and “Ready to create your account”.
- Preserve current validation, support, password visibility, referral code, error handling, and navigation.
- Cancel and restart the two-second readiness check whenever a relevant field changes.

## Technical details
- Add a small shared readiness/progress component and hook for both forms.
- Use an abortable request to the existing health endpoint for the early connection check; no account or database record is created before the button is pressed.
- Keep real registration and authentication calls unchanged, while advancing status text based on elapsed operation time.
- Add accessible live status announcements and respect reduced-motion preferences.
- Verify both forms on desktop and mobile, including invalid fields, field edits after readiness, failed credentials, and successful button enablement.
