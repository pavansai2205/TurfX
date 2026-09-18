from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment transaction object.
    """
    razorpayOrderId = serializers.CharField(
        source='razorpay_order_id',
        allow_null=True
    )
    razorpayPaymentId = serializers.CharField(
        source='razorpay_payment_id',
        allow_null=True
    )
    paymentStatus = serializers.CharField(source='payment_status')
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            'id',
            'razorpayOrderId',
            'razorpayPaymentId',
            'amount',
            'paymentStatus',
            'createdAt',
        ]
