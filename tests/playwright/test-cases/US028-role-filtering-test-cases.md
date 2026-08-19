# US028 - Role Filtering: Test Cases

Ticket: As an applicant I want to be able to filter the roles page by each of the
columns displayed in the roles table.

Requirements covered:
- Text box for free-text columns (role name, location)
- Checkboxes for limited-value columns (capability, band, status)
- Filtering performed on the API (not client-side), so API consumers can filter too

Mock data used (`tests/fixtures/testData.ts`):

| Role             | Location | Capability  | Band   | Status | Closing Date |
|------------------|----------|-------------|--------|--------|---------------|
| Software Engineer| London   | Engineering | Band 2 | Open   | 2026-12-31    |
| Data Analyst     | Belfast  | Data        | Band 3 | Open   | 2026-11-30    |
| Delivery Manager | London   | Delivery    | Band 4 | Closed | 2026-10-31    |

## Test Cases

| ID | Title | Steps | Expected Result | Automated |
|----|-------|-------|------------------|-----------|
| TC01 | Filter by role name (text) | Enter "Software" into role name box, apply filters | Only "Software Engineer" shown, URL contains `roleName=Software` | Yes (existing) |
| TC02 | Filter by location (text) | Enter "London" into location box, apply filters | Only London-based roles shown ("Software Engineer", "Delivery Manager") | Yes |
| TC03 | Filter with no matches | Enter "Astronaut" into role name box | Empty state "No job roles match your filters." shown | Yes (existing) |
| TC04 | Filter by capability (checkbox) | Open Capability dropdown, check "Engineering", apply | Only "Software Engineer" shown | Yes (existing) |
| TC05 | Filter by band (checkbox) | Open Band dropdown, check "Band 3", apply | Only "Data Analyst" shown | Yes |
| TC06 | Filter by status (checkbox) | Open Status dropdown, check "Closed", apply | Only "Delivery Manager" shown | Yes |
| TC07 | Filter by closing date | Enter closing date "2026-11-30", apply | Roles closing on/before that date shown ("Data Analyst", "Delivery Manager"); "Software Engineer" excluded | Yes |
| TC08 | Combine multiple filters | Set location "London" and status "Closed", apply | Only "Delivery Manager" shown (intersection of both filters) | Yes |
| TC09 | Checkbox filter shows active count | Check two options in the same dropdown (e.g. Band 2, Band 3) | Dropdown summary badge shows count "2" | Yes |
| TC10 | Clear filters resets all filter types | Apply text + checkbox + date filters, click "Clear filters" | URL returns to `/job-roles`, all inputs/checkboxes reset, all roles shown | Yes |
| TC11 | Filters preserved across pagination | Apply a filter that spans multiple pages, navigate to next page | Filter query params retained in pagination links, filtered result set consistent | Yes (existing) |
| TC12 | Filtering executed on the API (not just client) | Apply role name/location/capability/band/status/closingDate filters together | `jobRoleApiService.getPaginatedJobRoles` forwards every supplied filter as a request param to the API (`GET /api/job-roles`); the frontend never filters the full dataset itself | Yes (existing unit test) |
| TC13 | Filters forwarded through the router/controller layer | Request `/job-roles` with query filters | Controller extracts filters from `req.query` and passes them, unchanged, to the API service call | Yes (existing unit test) |

Notes:
- TC01, TC03, TC04, TC11 already existed in [job-roles.spec.ts](job-roles.spec.ts) prior to this change.
- TC12/TC13 are validated at the unit level in
  [jobRoleApiService.test.ts](../services/jobRoleApiService.test.ts) and
  [jobRoleController.test.ts](../controllers/jobRoleController.test.ts), confirming filtering
  is delegated to the API rather than done in-memory on the frontend.
- TC02, TC05-TC10 are newly automated in [job-roles.spec.ts](job-roles.spec.ts) as part of this change.
