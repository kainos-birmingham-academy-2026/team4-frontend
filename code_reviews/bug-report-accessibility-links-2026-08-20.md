# Accessibility Bug Report – Inline Links Not Distinct from Surrounding Text

Date: 2026-08-20
Project: team4-frontend
Affected pages:
- Login page
- Registration page
- Any inline text link block using a standard link colour without additional styling

## Summary
Axe flagged the inline link in the login page sign-up prompt as failing the rule “Ensure links are distinguished from surrounding text in a way that does not rely on colour”.

The failing element was:

```html
<div class="form-link">
  Don't have an account? <a href="/register">Create one now</a>
</div>
```

## Issue
The link was only distinguished by blue text and not by a second visual cue such as underlining. This fails the accessibility requirement because some users may not be able to detect links reliably when colour alone is used as the distinguishing feature.

## Axe evidence
The audit reported:
- link has insufficient color contrast of 2.93:1 with surrounding text
- link has no styling such as underline to distinguish it from surrounding text

## Root cause
The global link styling in the app used blue text with no underlining for inline links. On the form prompt, this meant the link visually blended into the surrounding sentence text.

## Fix implemented
The link styling was updated so that inline links are visually distinct using a second identifier, not colour alone:
- added underline styling to inline links
- increased text decoration thickness for emphasis
- retained a stronger focus state with a visible focus ring
- preserved the link colour to keep consistency while satisfying the non-colour-only requirement

## Files updated
- [public/assets/css/main.css](../public/assets/css/main.css)
- [src/views/pages/login.njk](../src/views/pages/login.njk)
- [src/views/pages/register.njk](../src/views/pages/register.njk)

## Validation
This fix addresses the specific axe rule for inline link readability and ensures links remain identifiable without relying solely on colour.
