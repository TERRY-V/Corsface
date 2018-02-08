# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import time
from django.db import models
from django.conf import settings
from django.utils.timesince import timesince

# 识别端
class RecognizeVersion(models.Model):
    version = models.CharField(u'识别端版本号', max_length=45, blank=True)
    def as_json(self):
        return dict(
            id=self.id,
            version=self.version
        )
    class Meta:
        db_table = 'recognize_version'
        managed = False
        verbose_name = u'识别端版本号'
        verbose_name_plural = u'识别端版本号'

class RecognizeServer(models.Model):
    server_name = models.CharField(u'识别端名称', max_length=255, blank=True)
    server_ip = models.CharField(u'识别端IP', max_length=45, blank=True)
    deepface_url = models.CharField(u'识别端URL', max_length=255, blank=True)
    appkey = models.CharField(u'AppKey', max_length=45, blank=True)
    remark = models.TextField(u'备注', blank=True)
    version = models.ForeignKey(RecognizeVersion, verbose_name=u'识别端版本号', on_delete=models.CASCADE)
    params = models.TextField(u'识别端参数', blank=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)
    status = models.IntegerField(u'状态', blank=True,default=1)
    is_enabled= models.IntegerField(u'识别端状态', blank=True,default=1)

    def as_json(self):
        return dict(
            id=self.id,
            server_name=self.server_name,
            server_ip=self.server_ip,
            deepface_url=self.deepface_url,
            remark=self.remark,
            version_id=self.version_id,
            is_enabled=self.is_enabled,
            appkey=self.appkey
        )
    class Meta:
        db_table = 'recognize_server'
        managed = False
        verbose_name = u'识别端'
        verbose_name_plural = u'识别端'

# 采集端
class CaptureVersion(models.Model):
    version = models.CharField(u'采集端版本号', max_length=45, blank=True)
    def as_json(self):
        return dict(
            id=self.id,
            version=self.version
        )
    class Meta:
        db_table = 'capture_version'
        managed = False
        verbose_name = u'采集端版本号'
        verbose_name_plural = u'采集端版本号'

class CaptureServer(models.Model):
    server_name = models.CharField(u'采集端名称', max_length=255, blank=True)
    server_ip = models.CharField(u'采集端IP', max_length=45, blank=True)
    server_flag = models.CharField(u'标识符', max_length=45, blank=True)
    remark = models.TextField(u'备注', blank=True)
    keycode = models.CharField(u'关键码', max_length=45, blank=True)
    version = models.ForeignKey(CaptureVersion, verbose_name=u'采集端版本号', on_delete=models.CASCADE)
    recognize = models.ForeignKey(RecognizeServer, verbose_name=u'识别端版本号', on_delete=models.CASCADE)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)
    status = models.IntegerField(u'状态', blank=True, default=1)
    def as_json(self):
        return dict(
            id=self.id,
            server_name=self.server_name,
            server_ip=self.server_ip,
            server_flag=self.server_flag,
            remark=self.remark,
            keycode=self.keycode,
            recognize_id=self.recognize_id,
            version_id=self.version_id
        )

    class Meta:
        db_table = 'capture_server'
        managed = False
        verbose_name = u'采集端'
        verbose_name_plural = u'采集端'

# 摄像头/视频源
class CameraConfig(models.Model):
    user_id = models.IntegerField(u'用户ID', null=True)
    solution = models.IntegerField(u'显示方案', default=1)
    cameras = models.CharField(u'摄像头列表', max_length=255, blank=True)
    def as_json(self):
        return dict(
            id=self.id,
            user_id=self.user_id,
            solution=self.solution,
            cameras=self.cameras
        )
    class Meta:
        db_table = 'camera_config'
        managed = False
        verbose_name = u'摄像头显示方案'
        verbose_name_plural = u'摄像头显示方案'

class CameraGroup(models.Model):
    group_name = models.CharField(u'摄像头分组名称', max_length=255, blank=True)
    remark = models.TextField(u'备注', blank=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)
    def as_json(self):
        return dict(
            id=self.id,
            group_name=self.group_name
        )
    class Meta:
        db_table = 'camera_group'
        managed = False
        verbose_name = u'摄像头分组信息'
        verbose_name_plural = u'摄像头分组信息'

class CameraInfo(models.Model):
    camera_name = models.CharField(u'摄像头名称', max_length=255, blank=True)
    group = models.ForeignKey(CameraGroup, verbose_name=u'摄像头分组', on_delete=models.CASCADE)
    capture_url = models.CharField(u'抓拍视频流', max_length=255, blank=True)
    debug_url = models.CharField(u'调试视频流', max_length=255, blank=True)
    display_url = models.CharField(u'播放视频流', max_length=255, blank=True)
    longitude = models.FloatField(u'经度', null=True)
    latitude = models.FloatField(u'纬度', null=True)
    capture = models.ForeignKey(CaptureServer, verbose_name=u'采集端ID', on_delete=models.CASCADE)
    src_id = models.CharField(u'视频源ID', max_length=100, null=True)
    is_enabled = models.IntegerField(u'是否启用', default=0)
    remark = models.TextField(u'备注', blank=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)
    status= models.IntegerField(u'状态', default=1)

    def as_json(self):
        return dict(
            id=self.id,
            camera_name=self.camera_name,
            capture_url=self.capture_url,
            debug_url=self.debug_url,
            display_url=self.display_url,
            is_enabled=self.is_enabled,
            capture_id=self.capture_id,
            group_id=self.group_id,
            longitude=self.longitude,
            latitude=self.latitude,
            remark=self.remark
        )

    class Meta:
        db_table = 'camera_info'
        managed = False
        verbose_name = u'摄像头信息'
        verbose_name_plural = u'摄像头信息'

# 人物信息
class PersonGroup(models.Model):
    group_uuid = models.CharField(u'人物分组UUID', max_length=45, blank=True)
    group_name = models.CharField(u'人物分组名称', max_length=255, blank=True)
    remark = models.TextField(u'备注', blank=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'person_group'
        managed = False
        verbose_name = u'人物分组信息'
        verbose_name_plural = u'人物分组信息'

class PersonInfo(models.Model):
    person_id = models.CharField(u'人物ID', max_length=45, blank=True)
    group = models.ForeignKey(PersonGroup, verbose_name=u'人物分组', on_delete=models.CASCADE)
    alarm_level = models.IntegerField(u'报警级别', default=1)
    name = models.CharField(u'人物姓名', max_length=255, blank=True)
    gender = models.IntegerField(u'性别', null=True)
    birthday = models.CharField(u'生日', max_length=100, null=True)
    id_card = models.CharField(u'证件号码', max_length=100, null=True)
    family_register = models.CharField(u'家庭住址', max_length=200, blank=True)
    nation = models.CharField(u'民族', max_length=100, blank=True)
    phone = models.CharField(u'电话', max_length=100, blank=True)
    face_image = models.CharField(u'人物照片', max_length=255, blank=True)
    remark = models.TextField(u'备注', blank=True)
    isdeleted = models.IntegerField(u'是否删除', default=0)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)
    updated_time = models.DateTimeField(u'更新时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'person_info'
        managed = False
        verbose_name = u'人物信息'
        verbose_name_plural = u'人物信息'

class PersonImage(models.Model):
    person_id = models.CharField(u'人物ID', max_length=45, blank=True)
    image_id = models.CharField(u'图片ID', max_length=45, blank=True)
    face_image = models.CharField(u'人物照片', max_length=255, blank=True)
    isdeleted = models.IntegerField(u'是否删除', default=0)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'person_image'
        managed = False
        verbose_name = u'人物图片'
        verbose_name_plural = u'人物图片'

class PersonDeploy(models.Model):
    deployed_person = models.ForeignKey(PersonInfo, verbose_name=u'人物ID', on_delete=models.CASCADE)
    recognize = models.ForeignKey(RecognizeServer, verbose_name=u'识别端', on_delete=models.CASCADE)
    status = models.IntegerField(u'布控状态', default=0)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'person_deploy'
        managed = False
        verbose_name = u'人物布控'
        verbose_name_plural = u'人物布控'

# 人脸序列
class FacetrackInfo(models.Model):
    facetrack_id = models.CharField(u'序列ID', max_length=45, blank=True)
    age = models.IntegerField(u'年龄', null=True)
    glasses = models.IntegerField(u'是否戴眼镜', null=True)
    sex = models.IntegerField(u'性别', null=True)
    src_id = models.CharField(u'视频源ID', max_length=45, null=True)
    descriptor = models.CharField(u'视频源描述', max_length=255, blank=True)
    state = models.IntegerField(u'状态', null=True)
    createdate = models.DateTimeField(u'抓拍时间', null=True)
    recognize = models.ForeignKey(RecognizeServer, verbose_name=u'识别端版本号', on_delete=models.CASCADE)
    status = models.IntegerField(u'匹配状态', null=True)
    matched_person = models.ForeignKey(PersonInfo, verbose_name=u'匹配人物', on_delete=models.CASCADE)
    matched_percent = models.FloatField(u'相似度', null=True)
    matched_score = models.FloatField(u'匹配分', null=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'facetrack_info'
        managed = False
        verbose_name = u'序列信息'
        verbose_name_plural = u'序列信息'

class FacetrackImage(models.Model):
    facetrack_id = models.CharField(u'序列ID', max_length=45, blank=True)
    image_name = models.CharField(u'图片名称', max_length=255, blank=True)
    image_path = models.CharField(u'图片路径', max_length=255, blank=True)
    image_quality = models.FloatField(u'图像质量', null=True)
    created_time = models.DateTimeField(u'创建时间', auto_now_add=True, null=True)

    class Meta:
        db_table = 'facetrack_image'
        managed = False
        verbose_name = u'序列图片'
        verbose_name_plural = u'序列图片'

