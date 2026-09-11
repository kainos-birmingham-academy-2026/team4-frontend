Feature: Assess role applications

  As a Recruitment Admin
  I want to assess applications for a job role
  So that I can decide who should be hired

  Scenario: An Admin reviews applications for a job role
    Given I am signed in as an Admin
    When I open the job specification for the first available job role
    Then I should see the applications for the role
    And I should be able to view the applicant's message

  Scenario: An Admin cancels hiring an applicant
    Given I am signed in as an Admin
    When I open the job specification for the first available job role
    And I choose to hire the applicant
    And I cancel the assessment confirmation
    Then the applicant should still have an In Progress status

  Scenario: An Admin hires an applicant
    Given I am signed in as an Admin
    When I open the job specification for the first available job role
    And I choose to hire the applicant
    And I confirm the assessment
    Then the applicant should have a Hired status
    And the role should have one fewer open position

  Scenario: An Admin rejects an applicant
    Given I am signed in as an Admin
    When I open the job specification for the second available job role
    And I choose to reject the applicant
    And I confirm the assessment
    Then the applicant should have a Rejected status