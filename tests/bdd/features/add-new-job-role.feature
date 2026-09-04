Feature: Add a new job role

  As an Admin
  I want to add a new role to an existing capability and band
  So that I can keep the job role information up to date

  Scenario: A User cannot see the Add new role action
    Given I am signed in to Kainos Careers
    When I view the available job roles
    Then I should not see the Add new role action

  Scenario: An Admin creates a new job role successfully
    Given I am signed in as an Admin
    When I open the Add new role form
    And I complete the new job role form
    And I submit the new job role
    Then I should see that the job role was successfully created

  Scenario: An Admin cannot submit an incomplete job role
    Given I am signed in as an Admin
    When I open the Add new role form
    And I submit the new job role without completing the form
    Then I should remain on the Add new role form
