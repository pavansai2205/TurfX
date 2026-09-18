from django.urls import path
from . import views

urlpatterns = [
    path('reviews', views.create_review, name='create-review'),
    path('reviews/<uuid:id>', views.delete_review, name='delete-review'),
]
