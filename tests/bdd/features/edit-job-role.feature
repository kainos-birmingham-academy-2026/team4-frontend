Feature: Edit a job role

  As an Admin
  I want to edit a role
  So that I can keep the software information up to date

  Scenario: An Admin opens the edit form from the job roles list
    Given I am signed in as an Admin
    When I open the edit form for the first available job role
    Then the edit form should be pre-populated with the role information

  Scenario: An Admin opens the edit form from the job specification
    Given I am signed in as an Admin
    When I open the job specification for the first available job role
    And I open the edit form from the job specification
    Then I should see the edit job role form

  Scenario: An Admin updates a job role successfully
    Given I am signed in as an Admin
    When I open the edit form for the first available job role
    And I change the job role name to "Senior Software Engineer"
    And I change the job role location to "Belfast"
    And I change the job role status to "Closed"
    And I submit the edited job role
    Then I should see that the job role was successfully updated
    And the edited job role data should be sent to the API

  Scenario: An Admin cannot submit an edit without a status
    Given I am signed in as an Admin
    When I open the edit form for the first available job role
    And I clear the job role status
    And I submit the edited job role
    Then I should remain on the edit job role form