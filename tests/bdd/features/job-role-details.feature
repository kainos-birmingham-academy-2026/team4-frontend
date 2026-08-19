Feature: View job role details
  As a candidate
  I want to view an advertised job role
  So that I can decide whether it is relevant to me

  Scenario: Candidate views the details of an advertised job role
    Given I am signed in to Kainos Careers
    When I view the available job roles
    And I select the first job role
    Then I should see the selected job role title
    And I should see the job description
    And I should see the role location, band, and capability
    And I should see the key responsibilities and open positions