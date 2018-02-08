from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^notify$', views.newFacetrack, name="newFacetrack"),
        url(r'^synchronize$', views.synchronize, name="synchronize")
        ]

