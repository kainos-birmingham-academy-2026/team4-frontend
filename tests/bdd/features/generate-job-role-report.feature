Feature: Generate a job roles report

  As an Admin
  I want to generate a report of all job roles
  So that I can provide an up to date export to stakeholders

  Scenario: An Admin generates a complete report from the last job roles page
    Given I am signed in as an Admin
    And I am on the job roles page as an Admin
    When I go to the last page of job roles
    Then I should be on the last page of the job roles
    When I generate the job roles report
    Then the job roles report should be downloaded as "job-roles.csv"
    And the job roles report should contain "Software Engineer"
    And the job roles report should contain "Platform Specialist 60"
    And the job roles report header should not contain "capabilityId"
    And the job roles report header should not contain "bandId"
    And the job roles report header should not contain "statusId"
