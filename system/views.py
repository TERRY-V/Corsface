from django.shortcuts import render

# Create your views here.

# -*- coding: utf-8 -*-
import os
import zipfile
import io
import csv
import time
import datetime
import random
import uuid
import re

from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, InvalidPage
from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from django.db.models import Q
from django.db import transaction
from system.models import *
from deepface.models import *
from usercenter.models import *
from django.conf import settings

'''系统设置'''


@login_required(login_url='/corsface/login')
def system(request):
    result = SystemConfig.objects.first()
    response_data = {
        'data_list': result,
    }
    return render(request, 'corsface/system/system.html', response_data)


@login_required(login_url='/corsface/login')
def saveSysData(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        if request.POST.get('site_logo'):
            request_data['site_logo'] = request.POST.get('site_logo')
        request_data['site_name'] = request.POST.get('site_name')
        request_data['version'] = request.POST.get('version')
        request_data['alert_weight'] = request.POST.get('alert_weight')
        request_data['copyright'] = request.POST.get('copyright')
        res = SystemConfig.objects.filter(id=1).update(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'

    return HttpResponse(json.dumps(response_data), content_type="application/json")


'''菜单设置'''


@login_required(login_url='/corsface/login')
def menu(request):
    response_data = {'code': -1, 'message': 'param is error'}
    request_pid = int(request.GET.get("pid", 0))


    record_list = SystemMenu.objects.filter(pid=request_pid).order_by('index')
    response = [ob.as_json() for ob in record_list]
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def menurole(request):
    response_data = {'code': -1, 'message': 'param is error'}
    request_pid = int(request.GET.get("pid", 0))

    user_id=request.user.id
    user_role=User.objects.filter(id=user_id).first()
    role_list=UsercenterRoleMenu.objects.filter(role_id=user_role.role_id).first()
    role_list= [int(i) for i in role_list.menu_id_str.split(',')]
    record_list = SystemMenu.objects.filter(pid=request_pid).order_by('index')
    response = [ob.as_json() for ob in record_list]
    response_role=[]
    for x in response:
        if x['id'] in role_list:
            response_role.append(x)


    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response_role
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def menuSystem(request):
    response_data = {'code': -1, 'message': 'param is error'}
    request_pid = int(request.GET.get("pid", 6))
    user_id = request.user.id
    user_role = User.objects.filter(id=user_id).first()
    role_list = UsercenterRoleMenu.objects.filter(role_id=user_role.role_id).first()
    role_list = [int(i) for i in role_list.menu_id_str.split(',')]

    record_list = SystemMenu.objects.exclude(pid=0).order_by('pid', 'index')
    response = [ob.as_json() for ob in record_list]
    pid_list = {}
    for x in response:
        if int(x['pid']) == int(request_pid) and int(x['id']) not in pid_list.keys() and int(x['id']) in role_list:
            x['childNode'] = []
            pid_list[x['id']] = x
        elif int(x['pid']) != int(request_pid) and int(x['pid']) in pid_list.keys() and int(x['id']) in role_list:
            pid_list[x['pid']]['childNode'].append(x)
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = sorted(list(pid_list.values()), key=lambda index: index['index'])
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def roletree(alist, id=0):
    subs = list()
    for v in alist:
        if v['id'] == id:
            subs.append(v)
            subs = subs + roletree(alist, v['pid'])
    return subs


@login_required(login_url='/corsface/login')
def menuList(request):
    response_data = {'code': -1, 'message': 'param is error'}
    request_pid = int(request.GET.get("pid", 0))
    cur_page = int(request.GET.get("pageno", 1))
    size_page = int(request.GET.get("pagesize", 13))

    record_list = SystemMenu.objects.filter(pid=request_pid).order_by('index')
    paginator = Paginator(record_list, size_page)
    try:
        contacts = paginator.page(cur_page)
    except (EmptyPage, InvalidPage):
        contacts = paginator.page(paginator.num_pages)

    response = []
    for i in contacts:
        group = {}
        group['id'] = i.id
        group['pid'] = i.pid
        group['name'] = i.name
        group['url'] = i.url
        group['index'] = i.index
        response.append(group)
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response
    response_data['allnum'] = len(record_list)

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def saveMenu(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['pid'] = int(request.POST.get('pid', 0))
        request_data['name'] = request.POST.get('name')
        request_data['url'] = request.POST.get('url')
        request_data['index'] = int(request.POST.get('index', 1))
        if int(id) > 0:
            res = SystemMenu.objects.filter(id=id).update(**request_data)
        else:
            res = SystemMenu.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'

    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = SystemMenu.objects.filter(id=post_id)
            response = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = response

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def menuDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', '')
        id_list = id.strip(',').split(',')
        if len(id_list) > 0:
            res_num = SystemMenu.objects.filter(pid__in=id_list).count()
            if not res_num:
                res = SystemMenu.objects.filter(id__in=id_list).delete()
                if res:
                    response_data['code'] = 0
                    response_data['message'] = 'delete is error'
            else:
                response_data['code'] = -1
                response_data['message'] = '请先删除下级菜单'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def menuPid(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method != 'POST':
        id = request.GET.get('id', 0)
        resultset = SystemMenu.objects.filter(id=id)
        response = [ob.as_json() for ob in resultset]
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def menuAll(request):
    response_data = {'code': -1, 'message': 'param is error'}
    resultset = SystemMenu.objects.all()
    response = [ob.as_json() for ob in resultset]
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")
'''数据字典设置'''


@login_required(login_url='/corsface/login')
def datadict(request):
    result = DataDict.objects.all()
    response_data = serializers.serialize('json', result)
    return HttpResponse('dataDict', content_type="application/json")


'''地图设置'''


@login_required(login_url='/corsface/login')
def map(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'GET':
        config=SystemConfig.objects.first()
        map_type=config.map_type
        resultset = MapConfig.objects.all()
        response = [ob.as_json() for ob in resultset]
        response_online = []
        response_unline = []
        for x in response:
            resultnum = MapConfigPoint.objects.filter(map_id=x['id']).count()
            x['num'] = resultnum
            if x['type']==1:
                response_online.append(x)
            else:
                response_unline.append(x)
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = {'online':response_online,'unline':response_unline,'type':map_type}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        request_data['name'] = request.POST.get('name')
        request_data['remark'] = request.POST.get('remark')
        request_data['img_path'] = request.POST.get('img_path')
        res = MapConfig.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', 0)
        if id:
            MapConfigPoint.objects.filter(map_id=id).delete()
            res = MapConfig.objects.filter(id=id).delete()
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'
            else:
                response_data['code'] = -1
                response_data['message'] = 'the map has point,please delete point first'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapCheck(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method != 'POST':
        post_id = request.GET.get('id', 0)
        obj = MapConfig.objects.exclude(id=post_id)
        for item in obj:
            item.is_used = 0
            item.save()

        if int(post_id) > 0:
            obj = MapConfig.objects.filter(id=post_id).first()
            obj.is_used = 1
            obj.save()
        response_data['code'] = 0
        response_data['message'] = 'success'
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def mapSystem(request):
    response_data = {'code': -1, 'message': 'param is error'}
    config = SystemConfig.objects.first()

    map_list=MapConfig.objects.filter(is_used=1).first()
    post_id=map_list.id
    map_type=-1
    if int(config.map_type)==1:
        map_type=map_list.type

    resultset = MapConfigPoint.objects.raw("SELECT a.*,b.camera_name FROM system_mapconfig_point as a left join camera_info as b \
                                on b.id=a.c_id where a.map_id=%s" % post_id)
    response = []
    for x in resultset:
        response.append(dict(
            id=x.id,
            point_left=x.point_left,
            point_top=x.point_top,
            c_id=x.c_id,
            map_id=x.map_id,
            camera_name=x.camera_name
        ))
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = {'map_id':post_id,'img_path':map_list.img_path,'longlat':map_list.longlat,'type':map_type,'point_list':response}
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def mapPoint(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'GET':
        post_id = request.GET.get('id', 0)
        resultset = MapConfigPoint.objects.raw("SELECT a.*,b.camera_name FROM system_mapconfig_point as a left join camera_info as b \
                                    on b.id=a.c_id where a.map_id=%s" % post_id)
        response = []
        for x in resultset:
            response.append(dict(
                id=x.id,
                point_left=x.point_left,
                point_top=x.point_top,
                c_id=x.c_id,
                map_id=x.map_id,
                camera_name=x.camera_name
            ))
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapPointSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        response_data = {'code': -1, 'message': 'save is error'}
        resultlist = request.POST.get('info')
        map_id = request.POST.get('map_id')
        resultlist = json.loads(resultlist)
        with transaction.atomic():
            MapConfigPoint.objects.filter(map_id=map_id).delete()
            for i in resultlist:
                MapConfigPoint.objects.create(**i)
            response_data['code'] = 0
            response_data['message'] = 'success'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapUpload(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        myFile = request.FILES.get("upload", None)  # 获取上传的文件，如果没有文件，则默认为None
        if not myFile:
            response_data = {'code': -1, 'message': 'no files for upload!'}
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        if myFile.content_type not in ['image/pjpeg', 'image/jpeg', 'image/x-png', 'image/png']:
            response_data = {'code': -1, 'message': 'files is not img!'}
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        try:
            unique_name = str(uuid.uuid1()) + '.jpg'
            destination = open(os.path.join(settings.STATICFILES_DIRS[0], 'Upload/map', unique_name), 'wb+')
            for chunk in myFile.chunks():
                destination.write(chunk)
            destination.close()
            img_url = os.path.join(settings.STATIC_URL, 'Upload/map', unique_name)
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['img_url'] = img_url
        except:
            response_data['code'] = -1
            response_data['message'] = 'upload error'

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def mapCamera(request):
    resultset = CameraGroup.objects.all()
    response = [ob.as_json() for ob in resultset]
    response_num = []
    for x in response:
        resultnum = CameraInfo.objects.filter(group_id=x['id'])
        response_ca = [ob.as_json() for ob in resultnum]
        x['cam'] = response_ca
        response_num.append(x)
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response_num
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def setMapType(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        type = request.POST.get('type')
        res = SystemConfig.objects.first()
        res.map_type=type
        res.save()
        response_data={}
        response_data['code'] = 0
        response_data['message'] = 'success'
    return HttpResponse(json.dumps(response_data), content_type="application/json")