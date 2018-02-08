from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^camerainfo$', views.cameraInfo, name="cameraInfo"),
        url(r'^camerastatstoday$', views.cameraStatsToday, name="cameraStatsToday"),
        url(r'^camerasolution$', views.cameraSolution, name="cameraSolution"),

        url(r'^facetrack$', views.facetrack, name="facetrack"),
        url(r'^facetrack/alarm$', views.facetrackAlarm, name="facetrackAlarm"),
        url(r'^facetrack/getfacetrackinfo$', views.getFacetrackInfo, name="getFacetrackInfo"),
        url(r'^facetrack/archive$', views.facetrackArchive, name="facetrackArchive"),
        url(r'^facetrack/matchfacetracktoperson$', views.matchFacetrackToPerson, name="matchFacetrackToPerson"),
        url(r'^facetrack/statstoday$', views.facetrackStatsToday, name="facetrackStatsToday"),
        url(r'^facetrack/alarm/statstoday$', views.facetrackAlarmStatsToday, name="facetrackAlarmStatsToday"),

        url(r'^uploadimage$', views.uploadImage, name="uploadImage"),
        url(r'^cropface$', views.cropFace, name="cropFace"),

        url(r'^person$', views.person, name="person"),
        url(r'^person/create$', views.createPerson, name="createPerson"),
        url(r'^person/createfromfacetrack$', views.createPersonFromFacetrack, name="createPersonFromFacetrack"),
        url(r'^person/getpersoninfo$', views.getPersonInfo, name="getPersonInfo"),
        url(r'^person/getpersonfacetrack$', views.getPersonFacetrack, name="getPersonFacetrack"),
        url(r'^person/change$', views.changePerson, name="changePerson"),
        url(r'^person/delete$', views.deletePerson, name="deletePerson"),
        url(r'^person/deploy$', views.deployPerson, name="deployPerson"),
        url(r'^person/deploy/info$', views.deployInfo, name="deployInfo"),
        url(r'^person/deploy/search$', views.deploySearch, name="deploySearch"),
        url(r'^person/deploy/delete$', views.deployDelete, name="deployDelete"),
        url(r'^person/deploy/synchronize$', views.deploySynchronize, name="deploySynchronize"),
        url(r'^person/image/delete$', views.deletePersonImage, name="deletePersonImage"),
        url(r'^person/group$', views.personGroup, name="personGroup"),
        url(r'^person/group/create$', views.createPersonGroup, name="createPersonGroup"),
        url(r'^person/group/change$', views.changePersonGroup, name="changePersonGroup"),
        url(r'^person/group/delete$', views.deletePersonGroup, name="deletePersonGroup"),

        url(r'^devicelist$', views.deviceList, name="deviceList"),
        url(r'^cameralist$', views.cameraList, name="cameraList"),
        url(r'^cameradel$', views.cameraDelete, name="cameraDelete"),
        url(r'^camerasave$', views.cameraSave, name="cameraSave"),
        url(r'^cameragroup$', views.cameraGroup, name="cameraGroup"),
        url(r'^cameracapture$', views.cameraCapture, name="cameraCapture"),
        url(r'^cameraenable$', views.cameraSaveEnable, name="cameraSaveEnable"),

        url(r'^captureversion$', views.captureVersion, name="captureVersion"),
        url(r'^capturesave$', views.captureSave, name="captureSave"),
        url(r'^capturelist$', views.captureList, name="captureList"),
        url(r'^capturedel$', views.captureDelete, name="captureDelete"),
        url(r'^captureenable$', views.captureEnable, name="captureEnable"),
        url(r'^getcapture$', views.getcapture, name="getcapture"),
        url(r'^getcamera$', views.getcamera, name="getcamera"),

        url(r'^recognizeall$', views.recognizeAll, name="recognizeAll"),
        url(r'^recognizeversion$', views.recognizeVersion, name="recognizeVersion"),
        url(r'^recognizelist$', views.recognizeList, name="recognizeList"),
        url(r'^recognizedel$', views.recognizeDelete, name="recognizeDelete"),
        url(r'^recognizesave$', views.recognizeSave, name="recognizeSave"),
        url(r'^recognizeenable$', views.recognizeEnable, name="recognizeEnable"),
        url(r'^recognizesync$', views.recognizeSync, name="recognizeSync"),
        ]

