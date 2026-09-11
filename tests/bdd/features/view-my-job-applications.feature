Feature: View my job applications

  As an applicant
  I want to view all of my job applications
  So that I know the status of my applications

  Scenario: An applicant views their job applications
    Given I am signed in as an applicant
    When I open my applications
    Then I should see the role name linked to its job details
    And I should see the application status

  Scenario: A visitor sees public navigation and must sign in to browse roles
    Given I am on the home page
    Then I should see the public navigation links
    When I choose Browse Roles from the navigation
    Then I should be redirected to sign in
