# Create your models here.
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
import json

'''系统设置'''


class SystemConfig(models.Model):
    site_name = models.CharField(u'站点名称', max_length=255)
    version = models.CharField(u'版本', max_length=255)
    site_logo = models.TextField(u'logo图片')
    map_type = models.IntegerField(u'地图启用类别', default=0)
    alert_weight = models.IntegerField(u'报警阈值', default=1)
    copyright = models.CharField(u'网站信息', max_length=255)

    class Meta:
        db_table = 'system_config'
        verbose_name = u'系统配置'
        verbose_name_plural = u'系统配置'
        managed = False


class SystemMenu(models.Model):
    pid = models.IntegerField(u'父id', null=True)
    name = models.CharField(u'名称', max_length=255)
    url = models.CharField(u'链接', max_length=255)
    index = models.IntegerField(u'排序', null=True)

    def as_json(self):
        return dict(
            id=self.id,
            pid=self.pid,
            name=self.name,
            url=self.url,
            index=self.index
        )

    class Meta:
        db_table = 'system_menu'
        verbose_name = u'菜单管理'
        verbose_name_plural = u'菜单管理'
        managed = False


class DataDict(models.Model):
    name = models.CharField(u'菜单名称', max_length=30)
    content_type_id = models.IntegerField(u'上级菜单', null=True)
    codename = models.CharField(u'链接', max_length=255, null=True)

    class Meta:
        db_table = 'auth_permission'
        verbose_name = u'数据字典'
        verbose_name_plural = u'数据字典'
        managed = False


class MapConfig(models.Model):
    is_used = models.IntegerField(u'是否使用', default=0)
    name = models.CharField(u'名称', max_length=255)
    remark = models.CharField(u'备注', max_length=255)
    img_path = models.CharField(u'地图地址', max_length=255)
    longlat= models.CharField(u'经纬度', max_length=255)
    type = models.IntegerField(u'地图类型', default=0)

    def as_json(self):
        return dict(
            id=self.id,
            is_used=self.is_used,
            remark=self.remark,
            name=self.name,
            img_path=self.img_path,
            type=self.type,
            longlat=self.longlat
        )

    class Meta:
        db_table = 'system_mapconfig'
        verbose_name = u'地图设置'
        verbose_name_plural = u'地图设置'
        managed = False


class MapConfigPoint(models.Model):
    point_left = models.FloatField(u'点左', default=0)
    point_top = models.FloatField(u'点顶', default=0)
    c_id = models.IntegerField(u'摄像头id', default=0)
    map_id = models.IntegerField(u'地图id', default=0)

    def as_json(self):
        return dict(
            id=self.id,
            point_left=self.point_left,
            point_top=self.point_top,
            c_id=self.c_id,
            map_id=self.map_id
        )

    class Meta:
        db_table = 'system_mapconfig_point'
        verbose_name = u'地图点设置'
        verbose_name_plural = u'地图点设置'
        managed = False

class CameraInfo(models.Model):
    camera_name = models.CharField(u'摄像头名', max_length=255)
    group_id = models.IntegerField(u'分组id', default=0)
    status= models.IntegerField(u'状态', default=1)
    def as_json(self):
        return dict(
            id=self.id,
            camera_name=self.camera_name,
            group_id=self.group_id
        )
    class Meta:
        db_table = 'camera_info'
        verbose_name = u'摄像头设置'
        verbose_name_plural = u'摄像头设置'
        managed = False

class CameraGroup(models.Model):
    group_name = models.CharField(u'分组名', max_length=50)
    remark = models.CharField(u'备注', max_length=255)
    created_time= models.DateTimeField(u'时间')
    def as_json(self):
        return dict(
            id=self.id,
            group_name=self.group_name,
            remark=self.remark,
        )
    class Meta:
        db_table = 'camera_group'
        verbose_name = u'摄像头分组设置'
        verbose_name_plural = u'摄像头分组设置'
        managed = False