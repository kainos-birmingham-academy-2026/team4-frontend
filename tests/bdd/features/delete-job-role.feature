Feature: Delete a job role

  As an Admin
  I want to delete a role
  So that I can keep the software information up to date

  Scenario: An Admin cancels deletion from the job roles list
    Given I am signed in as an Admin
    When I open the job roles list
    And I choose to delete the first available job role
    And I cancel the deletion confirmation
    Then the job role should still be visible

  Scenario: An Admin deletes a role from the job roles list
    Given I am signed in as an Admin
    When I open the job roles list
    And I choose to delete the first available job role
    And I confirm the deletion
    Then I should see that the job role was successfully deleted
    And the deleted job role should not be visible

  Scenario: An Admin deletes a role from the job specification
    Given I am signed in as an Admin
    When I open the job specification for the first available job role
    And I choose to delete the job role from the specification
    And I confirm the deletion
    Then I should see that the job role was successfully deleted
    And the deleted job role should not be visible