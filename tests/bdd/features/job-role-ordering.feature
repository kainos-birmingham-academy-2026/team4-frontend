Feature: Order job roles by table columns
  As an applicant
  I want to order the roles page by any displayed column
  So that I can find roles in the order I need

  Background:
    Given I am signed in to Kainos Careers
    And I view the available job roles

  Scenario: Applicant cycles through ascending, descending, and no ordering
    When I order job roles by "role name"
    Then job roles should be ordered by "role name" "ascending"
    When I order job roles by "role name"
    Then job roles should be ordered by "role name" "descending"
    When I order job roles by "role name"
    Then job roles should have no ordering