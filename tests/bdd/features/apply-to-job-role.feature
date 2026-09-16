Feature: Apply to a job role

  As an applicant
  I want to apply only to available job roles
  So that I cannot submit applications to closed roles

  Scenario: An applicant applies to an open role with available positions
    Given I am signed in as an applicant
    When I open the application form for the "Data Analyst" role
    And I enter the application message "I am interested in this role."
    And I submit the application
    Then I should see that my application was submitted

  Scenario: An applicant cannot apply to a closed role
    Given I am signed in as an applicant
    When I open the application form for the "Delivery Manager" role
    Then I should be told that the role is no longer accepting applications