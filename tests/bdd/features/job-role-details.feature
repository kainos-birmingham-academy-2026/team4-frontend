Feature: View job role details
  As a candidate
  I want to view an advertised job role
  So that I can decide whether it is relevant to me

  Scenario: Candidate views the details of an advertised job role
    Given I am signed in to Kainos Careers
    When I select a job role from the available job roles
    Then I should see the details of the selected job role
