from django.conf.urls import url
from usercenter.views import UserCenter
from . import views

urlpatterns = [
        url(r'^(?P<slug>\w+)check$', UserCenter.as_view()),
        url(r'^userlist$', views.userList, name="userList"),
        url(r'^userdel$', views.userDelete, name="userDelete"),
        url(r'^usersave$', views.userSave, name="userSave"),
        url(r'^rolelist$', views.roleList, name="roleList"),
        url(r'^rolesave$', views.roleSave, name="roleSave"),
        url(r'^roledel$', views.roleDelete, name="roleDelete"),
        url(r'^rolemenu$', views.roleMenu, name="roleMenu"),
        url(r'^rolemenusave$', views.roleMenuSave, name="roleMenuSave"),
        url(r'^roleuser$', views.roleUser, name="roleUser"),

]

