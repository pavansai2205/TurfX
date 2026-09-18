from django.test import TestCase
from rest_framework.test import APIClient
from .models import User


class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testplayer@example.com',
            password='password123',
            name='Test Player',
            phone='9999999999'
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123',
            name='Admin User',
            phone='8888888888'
        )

    def test_user_registration(self):
        response = self.client.post('/api/auth/register', {
            'name': 'New Player',
            'email': 'newplayer@example.com',
            'password': 'password123',
            'phone': '7777777777'
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'newplayer@example.com')

    def test_user_login(self):
        response = self.client.post('/api/auth/login', {
            'email': 'testplayer@example.com',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['name'], 'Test Player')

    def test_invalid_login_fails(self):
        response = self.client.post('/api/auth/login', {
            'email': 'testplayer@example.com',
            'password': 'wrongpassword'
        }, format='json')

        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid email or password', response.data['message'])

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'testplayer@example.com')

    def test_admin_users_list(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/admin/users')

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 2)
