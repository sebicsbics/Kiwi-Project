"""
Comprehensive test suite for login functionality
Tests cover authentication, authorization, security, and edge cases
"""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestLoginSuccess:
    """
    Test cases for successful login scenarios
    """

    def test_login_with_valid_credentials(self, api_client, create_user):
        """
        Test that a user can login with valid email and password
        """
        # Arrange
        user = create_user(email="valid@example.com", password="ValidPass123!")
        login_data = {"email": "valid@example.com", "password": "ValidPass123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]
        assert "user" in response.data
        assert response.data["user"]["email"] == "valid@example.com"
        assert response.data["message"] == "Inicio de sesión exitoso"

    def test_login_returns_user_data(self, api_client, create_user):
        """
        Test that login returns complete user data
        """
        # Arrange
        user = create_user(
            username="johndoe", email="john@example.com", first_name="John", last_name="Doe", password="SecurePass123!"
        )
        login_data = {"email": "john@example.com", "password": "SecurePass123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        user_data = response.data["user"]
        assert user_data["username"] == "johndoe"
        assert user_data["email"] == "john@example.com"
        assert user_data["first_name"] == "John"
        assert user_data["last_name"] == "Doe"
        assert "id" in user_data

    def test_login_tokens_are_valid_jwt(self, api_client, create_user):
        """
        Test that returned tokens are valid JWT tokens
        """
        # Arrange
        user = create_user(email="token@example.com", password="TokenPass123!")
        login_data = {"email": "token@example.com", "password": "TokenPass123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        access_token = response.data["tokens"]["access"]
        refresh_token = response.data["tokens"]["refresh"]

        # JWT tokens should have 3 parts separated by dots
        assert len(access_token.split(".")) == 3
        assert len(refresh_token.split(".")) == 3


@pytest.mark.django_db
class TestLoginFailure:
    """
    Test cases for failed login scenarios
    """

    def test_login_with_incorrect_password(self, api_client, create_user):
        """
        Test that login fails with incorrect password
        """
        # Arrange
        user = create_user(email="user@example.com", password="CorrectPass123!")
        login_data = {"email": "user@example.com", "password": "WrongPassword123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "error" in response.data
        assert response.data["error"] == "Credenciales inválidas"
        assert "tokens" not in response.data

    def test_login_with_non_existent_email(self, api_client):
        """
        Test that login fails with non-registered email
        """
        # Arrange
        login_data = {"email": "nonexistent@example.com", "password": "SomePassword123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "error" in response.data
        assert response.data["error"] == "Credenciales inválidas"

    def test_login_with_empty_password(self, api_client, create_user):
        """
        Test that login fails when password is empty
        """
        # Arrange
        user = create_user(email="user@example.com", password="ValidPass123!")
        login_data = {"email": "user@example.com", "password": ""}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

    def test_login_with_empty_email(self, api_client):
        """
        Test that login fails when email is empty
        """
        # Arrange
        login_data = {"email": "", "password": "SomePassword123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_login_with_invalid_email_format(self, api_client):
        """
        Test that login fails with invalid email format
        """
        # Arrange
        login_data = {"email": "not-an-email", "password": "SomePassword123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_login_with_missing_fields(self, api_client):
        """
        Test that login fails when required fields are missing
        """
        # Arrange
        url = reverse("login")

        # Act - Missing password
        response1 = api_client.post(url, {"email": "test@example.com"}, format="json")

        # Act - Missing email
        response2 = api_client.post(url, {"password": "Pass123!"}, format="json")

        # Act - Missing both
        response3 = api_client.post(url, {}, format="json")

        # Assert
        assert response1.status_code == status.HTTP_400_BAD_REQUEST
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert response3.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.security
class TestLoginSecurity:
    """
    Security-focused test cases for login functionality
    """

    def test_sql_injection_in_email_field(self, api_client, create_user):
        """
        Test protection against SQL injection in email field
        """
        # Arrange
        user = create_user(email="admin@example.com", password="AdminPass123!")

        sql_injection_attempts = [
            "admin@example.com' OR '1'='1",
            "admin@example.com'; DROP TABLE users; --",
            "admin@example.com' UNION SELECT * FROM users --",
            "' OR 1=1 --",
            "admin@example.com' AND '1'='1",
        ]
        url = reverse("login")

        # Act & Assert
        for injection_attempt in sql_injection_attempts:
            login_data = {"email": injection_attempt, "password": "AdminPass123!"}
            response = api_client.post(url, login_data, format="json")

            # Should either fail validation or return unauthorized
            assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]
            # Should never return success or tokens
            assert "tokens" not in response.data

    def test_sql_injection_in_password_field(self, api_client, create_user):
        """
        Test protection against SQL injection in password field
        """
        # Arrange
        user = create_user(email="user@example.com", password="UserPass123!")

        sql_injection_attempts = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "password' OR '1'='1' --",
        ]
        url = reverse("login")

        # Act & Assert
        for injection_attempt in sql_injection_attempts:
            login_data = {"email": "user@example.com", "password": injection_attempt}
            response = api_client.post(url, login_data, format="json")

            # Should return unauthorized (wrong password)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            assert "tokens" not in response.data

    def test_xss_attack_in_email_field(self, api_client):
        """
        Test protection against XSS attacks in email field
        """
        # Arrange
        xss_attempts = [
            "<script>alert('XSS')</script>@example.com",
            "test@example.com<script>alert('XSS')</script>",
            "javascript:alert('XSS')@example.com",
        ]
        url = reverse("login")

        # Act & Assert
        for xss_attempt in xss_attempts:
            login_data = {"email": xss_attempt, "password": "SomePass123!"}
            response = api_client.post(url, login_data, format="json")

            # Should fail validation or return unauthorized
            assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]

    def test_password_not_exposed_in_response(self, api_client, create_user):
        """
        Test that password is never exposed in API responses
        """
        # Arrange
        user = create_user(email="secure@example.com", password="SecurePass123!")
        login_data = {"email": "secure@example.com", "password": "SecurePass123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        response_str = str(response.data)
        assert "SecurePass123!" not in response_str
        assert "password" not in response.data.get("user", {})

    def test_case_sensitive_password(self, api_client, create_user):
        """
        Test that password comparison is case-sensitive
        """
        # Arrange
        user = create_user(email="case@example.com", password="CaseSensitive123!")
        url = reverse("login")

        # Act - Try with different case
        wrong_case_data = {"email": "case@example.com", "password": "casesensitive123!"}  # lowercase
        response = api_client.post(url, wrong_case_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_email_case_insensitive(self, api_client, create_user):
    """
    Test that email comparison is case-insensitive (standard email behavior).
    However, in this system, emails are case-sensitive.
    """
    # Arrange
    user = create_user(email="CaseTest@Example.com", password="TestPass123!")
    url = reverse("login")

    # Act - Try with different case
    login_data = {"email": "casetest@example.com", "password": "TestPass123!"}  # lowercase
    response = api_client.post(url, login_data, format="json")

    # Assert - Should fail (emails are case-sensitive in this system)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED  # Unauthorized because the email doesn't match exactly



@pytest.mark.django_db
class TestLoginEdgeCases:
    """
    Edge cases and boundary conditions for login
    """

    def test_login_with_whitespace_in_email(self, api_client, create_user):
        """
        Test login with whitespace in email
        """
        # Arrange
        user = create_user(email="test@example.com", password="TestPass123!")
        url = reverse("login")

        # Act - Email with leading/trailing whitespace
        login_data = {"email": "  test@example.com  ", "password": "TestPass123!"}
        response = api_client.post(url, login_data, format="json")

        # Assert - Should handle whitespace appropriately
        # Either trim and succeed, or fail validation
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]

    def test_login_with_very_long_email(self, api_client):
        """
        Test login with extremely long email
        """
        # Arrange
        long_email = "a" * 300 + "@example.com"
        login_data = {"email": long_email, "password": "TestPass123!"}
        url = reverse("login")

        # Act
        response = api_client.post(url, login_data, format="json")

        # Assert - Should handle gracefully
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]

    def test_login_with_special_characters_in_password(self, api_client, create_user):
        """
        Test login with special characters in password
        """
        # Arrange
        special_password = "P@$$w0rd!#$%^&*()_+-=[]{}|;:,.<>?"
        user = create_user(email="special@example.com", password=special_password)
        url = reverse("login")

        # Act
        login_data = {"email": "special@example.com", "password": special_password}
        response = api_client.post(url, login_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "tokens" in response.data

    def test_concurrent_login_attempts(self, api_client, create_user):
        """
        Test multiple concurrent login attempts with same credentials
        """
        # Arrange
        user = create_user(email="concurrent@example.com", password="ConcurrentPass123!")
        login_data = {"email": "concurrent@example.com", "password": "ConcurrentPass123!"}
        url = reverse("login")

        # Act - Multiple login attempts
        responses = []
        for _ in range(5):
            response = api_client.post(url, login_data, format="json")
            responses.append(response)

        # Assert - All should succeed
        for response in responses:
            assert response.status_code == status.HTTP_200_OK
            assert "tokens" in response.data


@pytest.mark.django_db
class TestLoginPerformance:
    """
    Performance and rate limiting tests
    """

    @pytest.mark.slow
    def test_multiple_failed_login_attempts(self, api_client, create_user):
        """
        Test behavior with multiple failed login attempts
        Note: This test checks current behavior. Rate limiting should be implemented.
        """
        # Arrange
        user = create_user(email="bruteforce@example.com", password="CorrectPass123!")
        url = reverse("login")

        # Act - Multiple failed attempts
        failed_attempts = 0
        for _ in range(10):
            login_data = {"email": "bruteforce@example.com", "password": "WrongPassword123!"}
            response = api_client.post(url, login_data, format="json")
            if response.status_code == status.HTTP_401_UNAUTHORIZED:
                failed_attempts += 1

        # Assert - All should fail (no rate limiting currently)
        # TODO: Implement rate limiting to prevent brute force attacks
        assert failed_attempts == 10
