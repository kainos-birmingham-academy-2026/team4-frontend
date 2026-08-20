Feature: Account authentication
  As a careers website user
  I want to sign in and create an account
  So that I can access the job opportunities

  Scenario: Registered user logs in successfully
    Given I have a registered account
    When I sign in with valid credentials
    Then I am authenticated successfully

  Scenario: User cannot log in with invalid credentials
    Given I have a registered account
    When I sign in with invalid credentials
    Then I am not authenticated
    And I am informed that my credentials are invalid

  Scenario: New user creates an account successfully
    Given I am ready to create an account
    When I provide valid registration details
    Then my account is created successfully

  Scenario: User cannot create an account with an existing email address
    Given I am ready to create an account
    When I use an email address that is already registered
    Then my account is not created
    And I am informed that the email address is already in use