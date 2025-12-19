"""
Authentication Service.

This module provides authentication services for the Flet app,
handling secure token storage and API authentication.
"""

import json
from typing import Any

import flet as ft

from apps.flet_app.config.settings import SECURE_STORAGE


class AuthService:
    """
    Authentication service for managing user authentication.

    This service handles token storage, retrieval, and authentication
    with the Django backend API.
    """

    TOKEN_KEY = "auth_token"
    USER_KEY = "user_data"

    def __init__(self, page: ft.Page) -> None:
        """
        Initialize the authentication service.

        Args:
            page: The Flet page instance for accessing client storage.
        """
        self.page = page

    async def save_token(self, token: str) -> None:
        """
        Save authentication token securely.

        Args:
            token: The authentication token to save.
        """
        if SECURE_STORAGE:
            await self.page.client_storage.set_async(self.TOKEN_KEY, token)
        else:
            self.page.client_storage.set(self.TOKEN_KEY, token)

    async def get_token(self) -> str | None:
        """
        Retrieve stored authentication token.

        Returns:
            The authentication token if exists, None otherwise.
        """
        if SECURE_STORAGE:
            return await self.page.client_storage.get_async(self.TOKEN_KEY)
        return self.page.client_storage.get(self.TOKEN_KEY)

    async def remove_token(self) -> None:
        """Remove stored authentication token."""
        if SECURE_STORAGE:
            await self.page.client_storage.remove_async(self.TOKEN_KEY)
        else:
            self.page.client_storage.remove(self.TOKEN_KEY)

    async def save_user_data(self, user_data: dict[str, Any]) -> None:
        """
        Save user data securely.

        Args:
            user_data: Dictionary containing user information.
        """
        user_json = json.dumps(user_data)
        if SECURE_STORAGE:
            await self.page.client_storage.set_async(self.USER_KEY, user_json)
        else:
            self.page.client_storage.set(self.USER_KEY, user_json)

    async def get_user_data(self) -> dict[str, Any] | None:
        """
        Retrieve stored user data.

        Returns:
            Dictionary containing user information if exists, None otherwise.
        """
        user_json: str | None
        if SECURE_STORAGE:
            user_json = await self.page.client_storage.get_async(self.USER_KEY)
        else:
            user_json = self.page.client_storage.get(self.USER_KEY)

        if user_json:
            return json.loads(user_json)
        return None

    async def clear_user_data(self) -> None:
        """Clear all stored user data and tokens."""
        await self.remove_token()
        if SECURE_STORAGE:
            await self.page.client_storage.remove_async(self.USER_KEY)
        else:
            self.page.client_storage.remove(self.USER_KEY)

    def is_authenticated(self) -> bool:
        """
        Check if user is authenticated.

        Returns:
            True if user has a valid token, False otherwise.
        """
        token = self.page.client_storage.get(self.TOKEN_KEY)
        return token is not None
