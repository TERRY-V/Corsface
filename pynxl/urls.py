from django.conf.urls import include, url
from django.contrib import admin

from . import views

urlpatterns = [
    # Examples:
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', views.home, name="home"),
    url(r'^corsface/', include('corsface.urls')),
    url(r'^deepface/', include('deepface.urls')),
    url(r'^image/', include('image.urls')),
    url(r'^listener/', include('listener.urls')),
    url(r'^usercenter/', include('usercenter.urls')),
    url(r'^system/', include('system.urls')),
    url(r'^analysis/', include('analysis.urls')),
]

