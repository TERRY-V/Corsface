from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^searchperson$', views.searchperson, name = "searchperson"),
    url(r'^searchfacetrack$', views.searchfacetrack, name = "searchfacetrack"),
    url(r'^propertyanalyze$', views.propertyanalyze, name = "propertyanalyze"),
    url(r'^matchfacetrack2facetrack$', views.matchFacetrack2Facetrack, name = "matchfacetrack2facetrack"),

    url(r'^facetrackstats/', views.facetrackStats, name="facetrackStatsDay"),
    url(r'^facetrackalarmstats/', views.facetrackAlarmStats, name="facetrackAlarmStatsDay"),
    url(r'^facetrackstatscount$', views.facetrackStatsCount, name = "facetrackStatsCount"),
    url(r'^cameracount$', views.cameraCount, name = "srcCount"),
    url(r'^sexagestats$', views.sexAgeStats, name = "sexAgeStats"),
]
