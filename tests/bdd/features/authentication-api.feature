Feature: Authentication API
  As a test engineer
  I want to verify the authentication API
  So that authentication responses are reliable for the application

  Scenario: User logs in with valid credentials
    Given the authentication API is available
    When I submit valid login credentials
    Then the login response should be successful
    And the response should contain an authentication token

  Scenario: User cannot log in with invalid credentials
    Given the authentication API is available
    When I submit invalid login credentials
    Then the login response should be unauthorized
    And the response should contain the error "Invalid email or password"

  Scenario: User registers successfully
    Given the authentication API is available
    When I submit valid registration details
    Then the registration response should be successful
    And the response should contain an authentication token

  Scenario: Existing user cannot register again
    Given the authentication API is available
    When I submit registration details for an existing user
    Then the registration response should be rejected
    And the response should contain the error "An account already exists for this email."