# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import AbstractUser


class string_with_title(str):
    def __new__(cls, value, title):
        instance = str.__new__(cls, value)
        instance._title = title
        return instance

    def title(self):
        return self._title

    __copy__ = lambda self: self
    __deepcopy__ = lambda self, memodict: self


class User(AbstractUser):
    last_login_ip = models.CharField(max_length=30, blank=True, null=True, verbose_name='登陆IP')
    img = models.CharField(max_length=200, default='/static/Upload/avatar/default.gif', verbose_name='头像地址')
    intro = models.CharField(max_length=200, blank=True, null=True, verbose_name='简介')
    address = models.CharField(max_length=200, verbose_name='联系地址', blank=True, null=True)
    phone = models.CharField(max_length=200, verbose_name='联系电话', blank=True, null=True)
    u_name = models.CharField(max_length=200, verbose_name='昵称', blank=True, null=True)
    sex = models.IntegerField(verbose_name='性别', default=0)
    email = models.CharField(max_length=200, verbose_name='email', blank=True, null=True)
    role_id = models.IntegerField(verbose_name='分组id', default=0)
    is_active = models.IntegerField(verbose_name='是否删除', default=1)
    def as_json(self):
        return dict(
            id=self.id,
            username=self.username,
            phone=self.phone,
            role_id=self.role_id,
            u_name=self.u_name,
            intro=self.intro,
            sex=self.sex,
            email=self.email,
            is_active=self.is_active
        )
    class Meta(AbstractUser.Meta):
        app_label = string_with_title('usercenter', u"用户管理")
        db_table = 'usercenter_user'
        verbose_name = u'用户管理'
        verbose_name_plural = u'用户管理'
        managed = False


class UsercenterRole(models.Model):
    role_name = models.CharField(max_length=30, verbose_name='角色名')
    e_name = models.CharField(max_length=200, verbose_name='英文名')
    remark = models.CharField(verbose_name='备注',max_length=255)

    def as_json(self):
        return dict(
            id=self.id,
            role_name=self.role_name,
            e_name=self.e_name,
            remark=self.remark
        )

    class Meta:
        db_table = 'usercenter_role'
        verbose_name = u'用户角色管理'
        verbose_name_plural = u'用户角色管理'
        managed = False


class UsercenterRoleMenu(models.Model):
    role_id = models.IntegerField(verbose_name='角色id', default=0)
    menu_id_str = models.CharField(verbose_name='菜单id', max_length=50)

    def as_json(self):
        return dict(
            id=self.id,
            role_id=self.role_id,
            menu_id_str=self.menu_id_str
        )

    class Meta:
        db_table = 'usercenter_role_menu'
        verbose_name = u'用户角色权限管理'
        verbose_name_plural = u'用户角色权限管理'
        managed = False
