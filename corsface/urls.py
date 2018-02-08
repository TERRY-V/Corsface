from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.main, name="main"),
    url(r'^login$', views.login, name="login"),
    url(r'^default$', views.main, name="default"),
    url(r'^index$', views.index, name="index"),
    url(r'^alarmrecord$', views.alarmRecord, name="alarmrecord"),
    url(r'^alarminfo$', views.alarminfo, name="alarminfo"),
    url(r'^facerecord$', views.facerecord, name="facerecord"),
    url(r'^faceinfo$', views.faceinfo, name="faceinfo"),
    url(r'^menumanager$', views.menumanager, name="menumanager"),

    url(r'^systemdevice$', views.systemdevice, name="systemdevice"),
    url(r'^systemcamera$', views.systemcamera, name="systemcamera"),
    url(r'^camerasetting$', views.camerasetting, name="camerasetting"),
    url(r'^camerasave/id=(\d+)$', views.camerasave, name="camerasave"),

    url(r'^systemcapture$', views.systemcapture, name="systemcapture"),
    url(r'^systemrecognize$', views.systemrecognize, name="systemrecognize"),

    url(r'^websocket$', views.websocket, name="websocket"),
    url(r'^vediosetting$', views.vediosetting, name="vediosetting"),

    url(r'^trackdetail$', views.trackdetail, name="trackdetail"),
    url(r'^details$', views.details, name="details"),
    url(r'^map$', views.map, name="map"),
    url(r'^offline_map$', views.offline_map, name="offline_map"),
    
    url(r'^persongroup$', views.persongroup, name="persongroup"),
    url(r'^personlist$', views.personlist, name="personlist"),
    url(r'^personform$', views.personform, name="personform"),
    url(r'^persondeploy$', views.persondeploy, name="persondeploy"),
    url(r'^personcreate_by_track$', views.personcreate_by_track, name="personcreate_by_track"),
    url(r'^persontrack$', views.persontrack, name="persontrack"),
    url(r'^facetracksearch$', views.facetracksearch, name="facetracksearch"),


    url(r'^mapshow$', views.mapshow, name="mapshow"),
    url(r'^mapchoose$', views.mapchoose, name="mapchoose"),
    url(r'^help$', views.help, name="help"),
    url(r'^getpersoninfo$', views.getpersoninfo, name="getpersoninfo"),
    url(r'^usermanagerlist$', views.usermanagerlist, name="usermanagerlist"),
    url(r'^usermanagerform$', views.usermanagerform, name="usermanagerform"),

    url(r'^commonuserdelect$', views.commonuserdelect, name="commonuserdelect"),
    url(r'^roleform$', views.roleform, name="roleform"),
    url(r'^rolelist$', views.rolelist, name="rolelist"),
    url(r'^roleselectmune$', views.roleselectmune, name="roleselectmune"),
    url(r'^roleselectuser$', views.roleselectuser, name="roleselectuser"),

    url(r'^analysis$', views.analysis, name="analysis"),
    url(r'^search$', views.search, name="search"),
]
