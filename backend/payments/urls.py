from django.urls import path
from . import views

urlpatterns = [
    path('payments/create-order', views.create_order, name='payment-create-order'),
    path('payments/verify', views.verify_payment, name='payment-verify'),
    path('payments/receipt/<uuid:booking_id>', views.get_booking_receipt, name='payment-receipt'),
]
