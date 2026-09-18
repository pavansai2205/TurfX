from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient

from turfs.models import Turf
from users.models import User
from .models import Review


class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='player@example.com',
            password='password123',
            name='Test Player',
            phone='9999999999'
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='password123',
            name='Turf Owner',
            phone='8888888888',
            role=User.Role.TURF_OWNER
        )
        self.turf = Turf.objects.create(
            name='Review Test Arena',
            description='Test arena',
            location='Bangalore',
            address='Test Address',
            price_per_hour=Decimal('500.00'),
            owner=self.owner
        )

    def test_create_review_updates_average_rating(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reviews', {
            'turfId': self.turf.id,
            'rating': 5,
            'comment': 'Awesome ground and pitch!'
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.turf.refresh_from_db()
        self.assertEqual(self.turf.rating, Decimal('5.0'))
