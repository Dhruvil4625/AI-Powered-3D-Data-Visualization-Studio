import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User

@pytest.mark.django_db
class TestAuthEndpoints:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'email': 'test@example.com'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert User.objects.filter(username='testuser').exists()

    def test_user_login(self):
        # Create user first
        User.objects.create_user(**self.user_data)
        
        # Test login
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, format='json')
        
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_duplicate_registration(self):
        # Create user first
        User.objects.create_user(**self.user_data)
        
        # Try to register again
        response = self.client.post(self.register_url, self.user_data, format='json')
        assert response.status_code == 400
        assert 'error' in response.data
