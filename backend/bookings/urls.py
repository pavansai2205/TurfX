from django.urls import path
from . import views

urlpatterns = [
    # Booking & Availability endpoints
    path('bookings/availability', views.check_availability, name='booking-availability'),
    path('bookings', views.create_booking, name='create-booking'),
    path('bookings/my-history', views.my_history, name='my-booking-history'),
    path('bookings/owner-ledgers', views.owner_ledgers, name='owner-ledgers'),
    path('bookings/<uuid:id>/cancel', views.cancel_booking, name='cancel-booking'),
    path('bookings/<uuid:id>/status', views.update_booking_status, name='update-booking-status'),

    # Admin Analytics & Booking overview endpoints
    path('admin/analytics', views.get_admin_analytics, name='admin-analytics'),
    path('admin/bookings', views.get_admin_bookings, name='admin-bookings'),
]
