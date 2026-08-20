Feature: Filter job roles by table columns
  As an applicant
  I want to filter the roles page by each of the columns displayed in the roles table
  So that I can quickly find roles relevant to me

  Background:
    Given I am signed in to Kainos Careers
    And I view the available job roles

  Scenario Outline: Filter job roles by a single filter
    When I filter job roles by "<filterType>" "<value>"
    Then I should see the job roles "<expectedRoles>"

    Examples:
      | filterType   | value      | expectedRoles                       |
      | location     | London     | Software Engineer, Delivery Manager |
      | band         | Band 3     | Data Analyst                        |
      | status       | Closed     | Delivery Manager                    |
      | closing date | 2026-11-30 | Data Analyst, Delivery Manager      |

  Scenario: Filter job roles with no matching results
    When I filter job roles by "role name" "Astronaut"
    Then I should see no matching job roles

  Scenario: Combine a text filter and a checkbox filter
    When I filter job roles by location "London" and status "Closed"
    Then I should see only the "Delivery Manager" role

  Scenario: Checkbox dropdown shows the number of active filters
    When I select the band filters "Band 2" and "Band 3"
    Then the band filter count should show "2"

  Scenario: Clearing filters resets every filter type
    Given I have applied role name, location, closing date and status filters
    When I clear the job role filters
    Then all job role filters should be cleared
