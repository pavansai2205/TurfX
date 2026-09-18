from datetime import date, timedelta
from decimal import Decimal

from django.db import IntegrityError
from django.test import TestCase
from rest_framework.test import APIClient

from turfs.models import Slot, Turf
from users.models import User
from .models import Booking


class BookingRulesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.player = User.objects.create_user(
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
            name='Test Arena',
            description='Test arena description',
            location='Bangalore',
            address='Test Address',
            price_per_hour=Decimal('800.00'),
            owner=self.owner
        )
        self.slot = Slot.objects.create(
            turf=self.turf,
            start_time='10:00',
            end_time='11:00'
        )

    def test_availability_rejects_past_dates(self):
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        response = self.client.get('/api/bookings/availability', {
            'turfId': self.turf.id,
            'date': yesterday
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn('future date', response.data['message'])

    def test_database_rejects_duplicate_active_booking(self):
        booking_data = {
            'user': self.player,
            'turf': self.turf,
            'slot': self.slot,
            'booking_date': date.today() + timedelta(days=1),
            'total_price': self.turf.price_per_hour,
        }
        Booking.objects.create(**booking_data)

        with self.assertRaises(IntegrityError):
            Booking.objects.create(**booking_data)

    def test_booking_requires_authentication(self):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        response = self.client.post('/api/bookings', {
            'turfId': self.turf.id,
            'slotId': self.slot.id,
            'bookingDate': tomorrow
        }, format='json')

        self.assertEqual(response.status_code, 401)

    def test_duplicate_booking_returns_conflict(self):
        self.client.force_authenticate(user=self.player)
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        payload = {
            'turfId': self.turf.id,
            'slotId': self.slot.id,
            'bookingDate': tomorrow
        }

        first_response = self.client.post('/api/bookings', payload, format='json')
        second_response = self.client.post('/api/bookings', payload, format='json')

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(second_response.status_code, 409)
        self.assertIn('already booked', second_response.data['message'])

    def test_cancel_booking(self):
        self.client.force_authenticate(user=self.player)
        tomorrow = date.today() + timedelta(days=1)
        booking = Booking.objects.create(
            user=self.player,
            turf=self.turf,
            slot=self.slot,
            booking_date=tomorrow,
            total_price=self.turf.price_per_hour
        )

        response = self.client.put(f'/api/bookings/{booking.id}/cancel')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['booking']['bookingStatus'], 'CANCELLED')
