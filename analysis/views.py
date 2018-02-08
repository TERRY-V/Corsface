import base64
import os
import json
import uuid
import requests
import sys 
import time
import datetime
from collections import OrderedDict

#from datetime import datetime, timedelta

from django.conf import settings
from django.contrib import auth
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.db.models import Count

from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.db import connection
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.shortcuts import render

from django.template.defaulttags import register
from django.utils import timezone
from django.utils.http import (base36_to_int, is_safe_url, urlsafe_base64_decode, urlsafe_base64_encode)
from django.utils.timesince import timesince
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View

from system.models import SystemConfig
from deepface.models import *
from deepface.deepfaceapi import DeepFaceAPI

from deepface.smoothing import smoothingAlgorithm


@login_required(login_url='/corsface/login')
def searchperson(request):
    if request.method == 'POST':
        crop_paths = json.loads(request.POST.get('crop_path'))
        recognize_id = request.POST.get('recognize_id')
        group_ids = json.loads(request.POST.get('group_ids'))

        recognizeServer = RecognizeServer.objects.get(id = recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
        response = deepFaceAPI.createfacetrack()
        facetrack_id = response['result']['results']['id_facetrack']
        for crop_path in crop_paths:
            f = open(crop_path[1:], 'rb')
            img = base64.b64encode(f.read())
            f.close()
            deepFaceAPI.addimgtofacetrack(str(img, "utf-8"), facetrack_id)
        response3 = deepFaceAPI.matchfacetrack2person(facetrack_id, group_ids)
        trans_id = response3['result']['results']['transId']
        while True:
            time.sleep(settings.FACETRACK_PERSON_RETRY_INTERVAL)
            response4 = deepFaceAPI.getmatchfacetrackresult(facetrack_id, trans_id)
            if response4['result']['results']['count'] == -1:
                continue
            else:
                break
        matches = response4['result']['results']['matchs']
        for item in matches:
            person_id = item['id_person']
            person = PersonInfo.objects.get(person_id = person_id)
            item['score'] = smoothingAlgorithm(item['score'])
            item['face_image'] = person.face_image
            item['name'] = person.name
            item['id_card'] = person.id_card
        data = {'matches': matches}
        deepFaceAPI.deletefacetrack(facetrack_id)
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")
                
@login_required(login_url='/corsface/login')
def searchfacetrack(request):
    if request.method == 'POST':
        crop_paths = json.loads(request.POST.get('crop_path'))
        recognize_id = request.POST.get('recognize_id')
        src_ids = json.loads(request.POST.get('src_ids'))
        src_ids = []
        #size_limit = request.POST.get('size_limit', 27) #记得要传整数
        #percent_high = request.POST.get('percent_high', 1.0)  #float
        #percent_low = request.POST.get('percent_low', 0.0)
        datetime_begin = request.POST.get('datetime_begin', '')
        datetime_end = request.POST.get('datetime_end', '')
        info = {
            "groups": src_ids,
            "datetime_begin": datetime_begin,
            "datetime_end": datetime_end
        }
        
        recognizeServer = RecognizeServer.objects.get(id = recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
        response = deepFaceAPI.createfacetrack()
        facetrack_id = response['result']['results']['id_facetrack']
        for crop_path in crop_paths:
            crop_path = crop_path[1:]
            f = open(crop_path, 'rb')
            img = base64.b64encode(f.read())
            f.close()
            deepFaceAPI.addimgtofacetrack(str(img, "utf-8"), facetrack_id)
        response3 = deepFaceAPI.matchfacetrack2facetrack(facetrack_id, info)
        trans_id = response3['result']['results']['transId']
        while True:
            time.sleep(settings.FACETRACK_PERSON_RETRY_INTERVAL)
            response4 = deepFaceAPI.getmatchfacetrack2facetrackresult(trans_id, facetrack_id)
            if response4['result']['results']['count'] == -1:
                continue
            else:
                break
        matches = response4['result']['results']['matchs']
        deepFaceAPI.deletefacetrack(facetrack_id)
        for i in range(len(matches))[::-1]:
            item = matches[i]
            facetrack_id = item['id_facetrack']
            if not FacetrackInfo.objects.filter(facetrack_id = facetrack_id).exists():
                matches.pop(i)
                continue
            facetrack = FacetrackInfo.objects.get(facetrack_id = facetrack_id)
            image_name = FacetrackImage.objects.filter(facetrack_id = facetrack_id).order_by("-image_quality")[0].image_name
            item['image'] = '/image?type=4&id=' + facetrack_id + '&fn=' +image_name
            item['score'] = smoothingAlgorithm(item['score'])
            item['age'] = facetrack.age
            item['sex'] = facetrack.sex
            item['src_name'] = CameraInfo.objects.get(src_id = facetrack.src_id).camera_name
            item['name'] = facetrack.matched_person.name if facetrack.matched_person_id else ''
            item['time'] = facetrack.createdate.strftime('%Y-%m-%d %H:%M:%S')
        data = {'matches': matches}
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

@login_required(login_url='/corsface/login')
def propertyanalyze(request):
    if request.method == 'POST':
        crop_paths = json.loads(request.POST.get('crop_path'))
        recognize_id = request.POST.get('recognize_id')

        recognizeServer = RecognizeServer.objects.get(id = recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
        response = deepFaceAPI.createfacetrack()
        facetrack_id = response['result']['results']['id_facetrack']
        for crop_path in crop_paths:
            crop_path = crop_path[1:]
            f = open(crop_path, 'rb')
            img = base64.b64encode(f.read())
            f.close()
            deepFaceAPI.addimgtofacetrack(str(img, "utf-8"), facetrack_id)

        response3 = deepFaceAPI.getfacetrackinfo(facetrack_id)
        if response3['result']['msg'] == 'SUCC':
            data = response3['result']['results']
            context = {'code': 0, 'message': 'success', 'data': data}
        else:
            context = {'code': -1, 'message': 'get facetrack error'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

@login_required(login_url='/corsface/login')
def matchFacetrack2SinglePerson(request):
    if request.method == 'POST':
        #这里是否需要指定person的位置,group_id
        facetrack_id = request.POST.get('facetrack_id')
        person_id = request.POST.get('person_id')
        recognize_id = request.POST.get('recognize_id')

        recognizeServer = RecognizeServer.objects.get(id = recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
        response = deepFaceAPI.matchfacetrack2singleperson(facetrack_id, person_id)
        score = response['result']['results']['score']
        data = {'score': score}
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

@login_required(login_url='/corsface/login')
def matchFacetrack2Facetrack(request):
    if request.method == 'POST':
        facetrack_id = request.POST.get('facetrack_id')
        #recognize_id = int(request.POST.get('recognize_id'))
        src_ids = json.loads(request.POST.get('src_ids'))
        src_ids = []
        #size_limit = request.POST.get('size_limit', 27) #记得要传整数
        #percent_high = request.POST.get('percent_high', 1.0)  #float
        #percent_low = request.POST.get('percent_low', 0.0)
        datetime_begin = request.POST.get('datetime_begin', '')
        datetime_end = request.POST.get('datetime_end', '')
        info = {
            "groups": src_ids,
            "datetime_begin": datetime_begin,
            "datetime_end": datetime_end
        }

        recognize_id = FacetrackInfo.objects.get(facetrack_id = facetrack_id).recognize_id
        recognizeServer = RecognizeServer.objects.get(id = recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)

        response = deepFaceAPI.matchfacetrack2facetrack(facetrack_id, info)
        trans_id = response['result']['results']['transId']
        while True:
            time.sleep(settings.FACETRACK_PERSON_RETRY_INTERVAL)
            response2 = deepFaceAPI.getmatchfacetrack2facetrackresult(trans_id, facetrack_id)
            if response2['result']['results']['count'] == -1:
                continue
            else:
                break
        matches = response2['result']['results']['matchs']
        for i in range(len(matches))[::-1]:
            item = matches[i]
            facetrack_id = item['id_facetrack']
            if not FacetrackInfo.objects.filter(facetrack_id = facetrack_id).exists():
                matches.pop(i)
                continue
            facetrack = FacetrackInfo.objects.get(facetrack_id = facetrack_id)
            image_name = FacetrackImage.objects.filter(facetrack_id = facetrack_id).order_by("-image_quality")[0].image_name
            item['image'] = '/image?type=4&id=' + facetrack_id + '&fn=' +image_name
            item['score'] = smoothingAlgorithm(item['score'])
            item['age'] = facetrack.age
            item['sex'] = facetrack.sex
            item['src_name'] = CameraInfo.objects.get(src_id = facetrack.src_id).camera_name
            item['name'] = facetrack.matched_person.name if facetrack.matched_person_id else ''
            item['time'] = facetrack.createdate.strftime('%Y-%m-%d %H:%M:%S')
        data = {'matches': matches}
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")


def facetrackStats(request):
    if request.method == 'GET':
        t1 = time.time()
        days = request.GET.get('days')
        src_ids = request.GET.get('src_ids')
        sql_src = ''
        if str(src_ids) != '0':
            src_ids = src_ids.split(",")
            sql_src += " and ( src_id = '" + src_ids[0] + "'"
            for i in range(1, len(src_ids)):
                sql_src += " or src_id = '" + src_ids[i] + "'"
            sql_src += " ) "

        now = datetime.datetime.now()
        data = OrderedDict()

        if days == "today":
            date = now.strftime("%Y-%m-%d 00:00:00")
            for i in range(now.hour):
                data[str(i)] = 0
            sql = "select Hour(createdate) hour, count(*) from CorsfaceRepo.facetrack_info where createdate > '%s' %s group by hour" % (date, sql_src)
        elif days == "yesterday":
            date = (now - datetime.timedelta(days = 1)).strftime("%Y-%m-%d")
            for i in range(24)[::-1]:
                data[(now - datetime.timedelta(hours = i)).strftime("%-H")] = 0
            sql = "select Hour(createdate) hour, count(*) from CorsfaceRepo.facetrack_info where date(createdate) = '%s' %s group by hour" % (date, sql_src)
        elif days == "week" or days == "month":
            theday = 7 if days == "week" else 30
            for i in range(theday)[::-1]:
                data[(now - datetime.timedelta(days = i + 1)).strftime("%Y-%m-%d")] = 0
            date = now - datetime.timedelta(days = theday)
            sql = "select Date(createdate) date, count(*) from CorsfaceRepo.facetrack_info where createdate > '%s' %s group by date" % (date, sql_src)
        else:
            context = {'code': -1, 'message': 'the params not correct'}
            return HttpResponse(json.dumps(context), content_type = "application/json")

        with connection.cursor() as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
        for result in results:
            data[str(result[0])] = result[1]
        context = {'code': 0, 'message': 'success', 'data': data}
        t2 = time.time()
        print("facetrack total spend time ", t2 - t1)
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

def facetrackAlarmStats(request):
    if request.method == 'GET':
        t1 = time.time()
        days = request.GET.get('days')
        src_ids = request.GET.get('src_ids')
        sql_src = ''
        if str(src_ids) != '0':
            src_ids = src_ids.split(",")
            sql_src += " and ( src_id = '" + src_ids[0] + "'"
            for i in range(1,len(src_ids)):
                sql_src += " or src_id = '" + src_ids[i] + "'"
            sql_src += " ) "
        
        now = datetime.datetime.now()
        data = OrderedDict()
        
        if days == "today":
            date = now.strftime("%Y-%m-%d 00:00:00")
            for i in range(now.hour):
                data[str(i)] = 0
            sql = "select Hour(createdate) hour, count(*) from CorsfaceRepo.facetrack_info where createdate > '%s' %s and matched_person_id is not null group by hour" % (date, sql_src)
        elif days == "yesterday":
            date = (now - datetime.timedelta(days = 1)).strftime("%Y-%m-%d")
            for i in range(24)[::-1]:
                data[(now - datetime.timedelta(hours = i)).strftime("%-H")] = 0
            sql = "select Hour(createdate) hour, count(*) from CorsfaceRepo.facetrack_info where date(createdate) = '%s' %s and matched_person_id is not null group by hour" % (date, sql_src)
        elif days == "week" or days == "month":
            theday = 7 if days == "week" else 30
            for i in range(theday)[::-1]:
                data[(now - datetime.timedelta(days = i + 1)).strftime("%Y-%m-%d")] = 0
            date = now - datetime.timedelta(days = theday)
            sql = "select Date(createdate) date, count(*) from CorsfaceRepo.facetrack_info where createdate > '%s' %s and matched_person_id is not null group by date" % (date, sql_src)
        else:
            context = {'code': -1, 'message': 'the params not correct'}
            return HttpResponse(json.dumps(context), content_type = "application/json")

        with connection.cursor() as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
        for result in results:
            data[str(result[0])] = result[1]
        context = {'code': 0, 'message': 'success', 'data': data}
        t2 = time.time()
        print("facetrack alarm spend time ",t2 - t1)
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

def facetrackStatsCount(request):
    if request.method == 'GET':
        t1 = time.time()
        data = {}
        now = datetime.datetime.now()
        today = now.strftime("%Y-%m-%d")
        data['todayStats'] = FacetrackInfo.objects.filter(createdate__gte = today).count()
        data['todayAlarmStats'] = FacetrackInfo.objects.filter(createdate__gte = today).exclude(matched_person_id = None).count()
        
        thetime = (now - datetime.timedelta(days = 1)).strftime("%Y-%m-%d")
        data['yesterdayStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today).count()
        data['yesterdayAlarmStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today).exclude(matched_person_id = None).count()
        
        thetime = (now - datetime.timedelta(days = 7)).strftime("%Y-%m-%d")
        data['weekStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime).count()
        data['weekAlarmStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime).exclude(matched_person_id = None).count()

        thetime = (now - datetime.timedelta(days = 30)).strftime("%Y-%m-%d")
        data['monthStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime).count()
        data['monthAlarmStats'] = FacetrackInfo.objects.filter(createdate__gte = thetime).exclude(matched_person_id = None).count()

        data['totalStats'] = FacetrackInfo.objects.all().count()
        data['totalAlarmStats'] = FacetrackInfo.objects.exclude(matched_person_id = None).count()

        context = {'code': 0, 'message': 'success', 'data': data}
        t2 = time.time()
        print("statsCount spend time ", t2 - t1)
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

#FacetrackInfo.objects.values_list("src_id").annotate(num = Count("src_id")).order_by('-num')[:10]
def cameraCount(request):
    if request.method == 'GET':
        t1 = time.time()
        theday = request.GET.get('days')
        src_ids = request.GET.get('src_ids')
        querys = Q()
        querys.connector = 'OR'
        if str(src_ids) != '0':
            src_ids = src_ids.split(",")
            for src_id in src_ids:
                querys.children.append(('src_id', src_id))

        dayTime = {"today": 0, "yesterday": 1, "week": 7, "month": 30}
        if theday in dayTime.keys():
            days = dayTime[theday]
        else:
            context = {'code': -1, 'message': 'the params not correct'}
            return HttpResponse(json.dumps(context), content_type = "application/json")

        thetime = (datetime.datetime.now() - datetime.timedelta(days = days)).strftime("%Y-%m-%d")

        if theday == "yesterday":
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            src_ids = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today).filter(querys).values_list("src_id").annotate(num = Count("src_id")).order_by('-num')[:10]
        else:
            src_ids = FacetrackInfo.objects.filter(createdate__gte = thetime).filter(querys).values_list("src_id").annotate(num = Count("src_id")).order_by('-num')[:10]

        stats_src = OrderedDict()
        for src in src_ids:
            src_name = CameraInfo.objects.get(src_id = src[0]).camera_name
            stats_src[src_name] = src[1]
        data = {}
        data['stats_camera'] = stats_src
        context = {'code': 0, 'message': 'success', 'data': data}
        t2 = time.time()
        print("camera top 10 spend ", t2 - t1)
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")
        
def sexAgeStats(request):
    if request.method == 'GET':
        t1 = time.time()
        theday = request.GET.get('days')
        src_ids = request.GET.get('src_ids')
        querys = Q()
        querys.connector = 'OR'
        if str(src_ids) != '0':
            src_ids = src_ids.split(",")
            for src_id in src_ids:
                querys.children.append(('src_id', src_id))

        dayTime = {"today": 0, "yesterday": 1, "week": 7, "month": 30}
        if theday in dayTime.keys():
            days = dayTime[theday]
        else:
            context = {'code': -1, 'message': 'the param not correct'}
            return HttpResponse(json.dumps(context), content_type = "application/json")

        thetime = (datetime.datetime.now() - datetime.timedelta(days = days)).strftime("%Y-%m-%d")
        today = datetime.datetime.now().strftime("%Y-%m-%d") if theday != "today" else datetime.datetime.now()
        data = {}
        gender = {}
        gender['male'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, sex = 0).filter(querys).count()
        gender['female'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, sex = 1).filter(querys).count()
        data['gender'] = gender
        age = {}
        age['z2twenty'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, age__lte = 20, age__gt = 0).filter(querys).count()
        age['t2thirty'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, age__lte = 30, age__gt = 20).filter(querys).count()
        age['t2fourty'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, age__lte = 40, age__gt = 30).filter(querys).count()
        age['f2sixty'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, age__lte = 60, age__gt = 40).filter(querys).count()
        age['older'] = FacetrackInfo.objects.filter(createdate__gte = thetime, createdate__lte = today, age__gte = 60).filter(querys).count()
        data['age'] = age

        context = {'code': 0, 'message': 'success', 'data': data}
        t2 = time.time()
        print("sex age count spend time ", t2 - t1)
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type = "application/json")

