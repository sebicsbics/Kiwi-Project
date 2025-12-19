"""
Pytest configuration and fixtures for the Kiwi backend tests
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """
    Fixture to provide a DRF API client
    """
    return APIClient()


@pytest.fixture
def create_user(db):
    """
    Fixture to create a test user
    """

    def make_user(**kwargs):
        defaults = {
            "username": "testuser",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "phone": "70123456",
        }
        defaults.update(kwargs)

        password = defaults.pop("password", "TestPass123!")
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()

        # Store the password for testing
        user.raw_password = password
        return user

    return make_user


@pytest.fixture
def authenticated_client(api_client, create_user):
    """
    Fixture to provide an authenticated API client
    """
    user = create_user()
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    api_client.user = user
    return api_client


@pytest.fixture
def valid_user_data():
    """
    Fixture to provide valid user registration data
    """
    return {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "SecurePass123!",
        "password2": "SecurePass123!",
        "first_name": "New",
        "last_name": "User",
        "phone": "70987654",
    }


@pytest.fixture
def valid_login_data():
    """
    Fixture to provide valid login data
    """
    return {
        "email": "test@example.com",
        "password": "TestPass123!",
    }
