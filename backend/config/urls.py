from common.views import health_check
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Health Check API
    path('api/health', health_check, name='health-check'),

    # Modular Domain APIs under /api/
    path('api/', include('users.urls')),
    path('api/', include('turfs.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('reviews.urls')),
]
