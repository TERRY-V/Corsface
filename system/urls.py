from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.system, name="deepface"),
    url(r'^deepface$', views.system, name="deepface"),
    url(r'^SaveSysData$', views.saveSysData, name="saveSysData"),
    url(r'^menu$', views.menu, name="menu"),
    url(r'^menurole$', views.menurole, name="menurole"),
    url(r'^menusystem$', views.menuSystem, name="menuSystem"),
    url(r'^menulist$', views.menuList, name="menuList"),
    url(r'^savemenu$', views.saveMenu, name="saveMenu"),
    url(r'^menudel$', views.menuDelete, name="menuDelete"),
    url(r'^menupid$', views.menuPid, name="menuPid"),
    url(r'^menuall$', views.menuAll, name="menuAll"),
    url(r'^map$', views.map, name="map"),
    url(r'^mapdel$', views.mapDelete, name="mapDelete"),
    url(r'^mapcheck$', views.mapCheck, name="mapCheck"),
    url(r'^mappoint$', views.mapPoint, name="mapPoint"),
    url(r'^mapsystem$', views.mapSystem, name="mapSystem"),
    url(r'^mapsave$', views.mapSave, name="mapSave"),
    url(r'^mapupload$', views.mapUpload, name="mapUpload"),
    url(r'^mappointsave$', views.mapPointSave, name="mapPointSave"),
    url(r'^mapcamera$', views.mapCamera, name="mapCamera"),
    url(r'^setmaptype$', views.setMapType, name="setMapType"),

]
