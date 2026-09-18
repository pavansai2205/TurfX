from django.urls import path
from . import views

urlpatterns = [
    path('turfs', views.list_or_create_turfs, name='turfs-list-create'),
    path('turfs/<uuid:id>', views.turf_detail_view, name='turf-detail'),
]
