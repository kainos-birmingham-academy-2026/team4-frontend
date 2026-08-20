Feature: Browse job roles page by page

  Background:
    Given I am signed in to Kainos Careers
    And I view the available job roles

  Scenario: Candidate sees the pagination controls below the results
    Then I should see the first, previous, next, and last page links
    And I should be on page 1 of the job roles
    And I should see a full page of job roles

  Scenario Outline: Candidate pages forward through the job roles
    When I move forward <clicks> pages of job roles
    Then I should be on page <page> of the job roles
    And I should see a full page of job roles

    Examples:
      | clicks | page |
      | 1      | 2    |
      | 2      | 3    |
      | 3      | 4    |
      | 4      | 5    |
      | 5      | 6    |

  Scenario: Candidate moves one page forward with the Next link
    Given I note the first job role shown
    When I go to the next page of job roles
    Then I should be on page 2 of the job roles
    And I should see a full page of job roles
    And I should not see the job role I noted first

  Scenario: Candidate moves one page back with the Previous link
    When I move forward 2 pages of job roles
    And I note the first job role shown
    And I go to the previous page of job roles
    Then I should be on page 2 of the job roles
    And I should see a full page of job roles
    And I should not see the job role I noted first

  Scenario: Candidate returns to the start with the First link
    Given I note the first job role shown
    When I go to the next page of job roles
    And I go to the first page of job roles
    Then I should be on page 1 of the job roles
    And I should see the job role I noted first
    And the "First" link should be disabled
    And the "Previous" link should be disabled

  Scenario: Candidate jumps to the end with the Last link
    When I go to the last page of job roles
    Then I should be on the last page of the job roles
    And the "Next" link should be disabled
    And the "Last" link should be disabled
