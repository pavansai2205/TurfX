from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/me', views.me, name='me'),
    path('auth/forgot-password', views.forgot_password, name='forgot-password'),

    # User profile management endpoints
    path('users/profile', views.profile, name='user-profile'),
    path('users/change-password', views.change_password, name='change-password'),

    # Admin user management endpoints
    path('admin/users', views.admin_users, name='admin-users'),
    path('admin/users/<uuid:id>', views.admin_user, name='admin-user'),
    path('admin/users/<uuid:id>/role', views.admin_user, name='admin-user-role'),
]
