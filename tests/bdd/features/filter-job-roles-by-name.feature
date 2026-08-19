Feature: Filter job roles by role name

  Scenario: Candidate filters roles by job title
    Given I am signed in to Kainos Careers
    And I view the available job roles
    When I filter job roles by "Software"
    Then I should see roles matching "Software"
