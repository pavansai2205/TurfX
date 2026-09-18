from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from .models import Slot, Turf


class TurfManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='password123',
            name='Turf Owner',
            phone='9999999999',
            role=User.Role.TURF_OWNER
        )
        self.turf = Turf.objects.create(
            name='Indiranagar Arena',
            description='Prime turf',
            location='Bangalore',
            address='Indiranagar',
            price_per_hour=Decimal('1000.00'),
            owner=self.owner
        )
        Slot.objects.create(turf=self.turf, start_time='06:00', end_time='07:00')

    def test_list_turfs(self):
        response = self.client.get('/api/turfs')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['turfs']), 1)
        self.assertEqual(response.data['turfs'][0]['name'], 'Indiranagar Arena')

    def test_create_turf_generates_hourly_slots(self):
        self.client.force_authenticate(user=self.owner)
        payload = {
            'name': 'Koramangala Sports Hub',
            'description': 'Multi sports arena',
            'location': 'Bangalore',
            'address': '5th Block Koramangala',
            'pricePerHour': '1500.00',
            'images': [],
            'amenities': ['Parking']
        }
        response = self.client.post('/api/turfs', payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertIn('turf', response.data)
        slots = response.data['turf']['slots']
        self.assertEqual(len(slots), 16)
