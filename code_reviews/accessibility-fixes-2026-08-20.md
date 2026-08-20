# Accessibility Fixes – Link Distinction and Keyboard Focus

Date: 2026-08-20
Project: team4-frontend

## Summary
This fix addresses the accessibility issues identified during the manual review and axe checks, focusing on the following:
- inline links were not visually distinct from surrounding text
- keyboard focus was not clearly visible on interactive controls
- filter groups were not clearly structured for assistive technology users

## Fixes applied

### 1) Inline links are now visually distinct without relying on colour alone
Updated styles in [public/assets/css/main.css](../public/assets/css/main.css):
- added underline to inline links in form text blocks
- increased underline thickness for emphasis
- kept the link bold to improve readability
- ensured the hover and focus states are also visually clear

This fixes the axe rule:
- Ensures links are distinguished from surrounding text in a way that does not rely on colour

### 2) Keyboard focus visibility restored
Updated styles in [public/assets/css/main.css](../public/assets/css/main.css):
- removed the global `outline: none` effect from focus states
- added a strong visible focus ring using `:focus-visible`
- included buttons, links, `summary`, and form fields in the focus styling

This improves keyboard navigation and makes focus obvious to all keyboard users.

### 3) Filter groups are more accessible
Updated structure in [src/views/pages/job-roles.njk](../src/views/pages/job-roles.njk):
- wrapped filter dropdowns in fieldset/legend styling for clearer grouping
- kept the related controls associated with their labelled category

This improves screen-reader comprehension of grouped filters.

## Files updated
- [public/assets/css/main.css](../public/assets/css/main.css)
- [src/views/pages/job-roles.njk](../src/views/pages/job-roles.njk)
- [src/views/pages/login.njk](../src/views/pages/login.njk)
- [src/views/pages/register.njk](../src/views/pages/register.njk)

## Notes
The issue was caused by relying on blue text alone as the only signal of a link, which is not sufficient for accessibility. The fix adds a second visual cue (underline) and preserves a visible focus state for keyboard users.
