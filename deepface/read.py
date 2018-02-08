# -*- coding: utf-8 -*-

import base64
import os
import json
import uuid
import datetime
import requests
import sys
import time
import re

from channels import Channel
from PIL import Image

from django.conf import settings
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, InvalidPage
from django.db import connection
from django.db.models import Q

from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.views.decorators.csrf import csrf_exempt

from deepface.models import *
from deepface.deepfaceapi import DeepFaceAPI
from deepface.smoothing import smoothingAlgorithm


@login_required(login_url='/corsface/login')
def cameraSolution(request):
    if request.method == 'GET':
        if CameraConfig.objects.filter(user_id=request.user.id).exists():
            cameraConfig = CameraConfig.objects.get(user_id=request.user.id)
            cameras = []
            for src_id in json.loads(cameraConfig.cameras):
                if CameraInfo.objects.filter(src_id=src_id).exists():
                    cameraInfo = CameraInfo.objects.get(src_id=src_id)
                    camera = {}
                    camera['camera_name'] = cameraInfo.camera_name
                    camera['display_url'] = cameraInfo.display_url
                    camera['src_id'] = src_id
                    cameras.append(camera)
            context = {
                'code': 0,
                'message': 'success',
                'solution': cameraConfig.solution,
                'cameras': cameras
            }
        else:
            context = {
                'code': 0,
                'message': 'success',
                'solution': 1,
                'cameras': None
            }
    else:
        solution = request.POST.get('solution')
        cameras = request.POST.get('cameras')
        if CameraConfig.objects.filter(user_id=request.user.id).exists():
            cameraConfig = CameraConfig.objects.get(user_id=request.user.id)
            cameraConfig.solution = solution
            cameraConfig.cameras = cameras
            cameraConfig.save()
        else:
            cameraConfig = CameraConfig(user_id=request.user.id, solution=solution, cameras=cameras)
            cameraConfig.save()
        context = {'code': 0, 'message': 'success'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraInfo(request):
    if request.method == 'GET':
        cameraGroup = CameraGroup.objects.all()
        cameras = []
        for group in cameraGroup:
            camera_group = {}
            camera_group['group_id'] = group.id
            camera_group['group_name'] = group.group_name
            camera_group['cameras'] = []
            for camera in group.camerainfo_set.filter(group_id=group.id, is_enabled=1):
                camera_info = {}
                camera_info['camera_name'] = camera.camera_name
                camera_info['capture_url'] = camera.capture_url
                camera_info['debug_url'] = camera.debug_url
                camera_info['display_url'] = camera.display_url
                camera_info['longitude'] = camera.longitude
                camera_info['latitude'] = camera.latitude
                camera_info['src_id'] = camera.src_id
                camera_group['cameras'].append(camera_info)
            cameras.append(camera_group)
        context = {'code': 0, 'message': 'success', 'data': cameras}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraStatsToday(request):
    if request.method == 'POST':
        src_id = request.POST.get('src_id')
        if src_id is not None and len(src_id):
            facetracks_today = FacetrackInfo.objects.filter(src_id=src_id,
                                                            createdate__gte=datetime.datetime.now().date()).count()
            facetracks_alarm_today = FacetrackInfo.objects.filter(src_id=src_id,
                                                                  createdate__gte=datetime.datetime.now().date(),
                                                                  status__gte=1).count()
        else:
            facetracks_today = FacetrackInfo.objects.filter(createdate__gte=datetime.datetime.now().date()).count()
            facetracks_alarm_today = FacetrackInfo.objects.filter(createdate__gte=datetime.datetime.now().date(),
                                                                  status__gte=1).count()
        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'facetracks_today': facetracks_today,
                'facetracks_alarm_today': facetracks_alarm_today
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def facetrack(request):
    if request.method == 'POST':
        src_ids = request.POST.get('src_ids')
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')
        is_processed = request.POST.get('is_processed')
        page = int(request.POST.get('page', 1))
        number = int(request.POST.get('number', 10))
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        id_card = request.POST.get('id_card')
        group_id = request.POST.get('group_id')

        facetracks_record = FacetrackInfo.objects.filter(status__gte=0).order_by('-id')
        if src_ids is not None and len(src_ids):
            src_ids = src_ids.split(',')
            facetracks_record = facetracks_record.filter(src_id__in=src_ids)
        if start_time is not None:
            facetracks_record = facetracks_record.filter(createdate__gte=start_time)
        if end_time is not None:
            facetracks_record = facetracks_record.filter(createdate__lte=end_time)
        if is_processed is not None and len(is_processed):
            is_processed = int(is_processed)
            if is_processed == 1:
                facetracks_record = facetracks_record.filter(status=1)
            elif is_processed == 2:
                facetracks_record = facetracks_record.filter(status=2)
            elif is_processed == 0:
                facetracks_record = facetracks_record.filter(status=0)
            else:
                pass
        if name is not None and len(name):
            facetracks_record = facetracks_record.filter(matched_person__name__contains=name)
        if gender is not None and len(gender):
            facetracks_record = facetracks_record.filter(matched_person__gender=int(gender))
        if id_card is not None and len(id_card):
            facetracks_record = facetracks_record.filter(matched_person__id_card=id_card)
        if group_id is not None and len(group_id):
            facetracks_record = facetracks_record.filter(matched_person__group_id=int(group_id))
        facetracks_total = facetracks_record.count()
        facetracks_record = facetracks_record[(page - 1) * number:page * number]

        facetracks = []
        for facetrack_record in facetracks_record:
            facetrack = {}
            facetrack['facetrack_id'] = facetrack_record.facetrack_id
            facetrack['age'] = facetrack_record.age
            facetrack['glasses'] = facetrack_record.glasses
            facetrack['src_id'] = facetrack_record.src_id
            camera_info = CameraInfo.objects.get(src_id=facetrack_record.src_id)
            facetrack['camera_name'] = camera_info.camera_name
            facetrack_image = FacetrackImage.objects.filter(facetrack_id=facetrack_record.facetrack_id).first()
            facetrack[
                'image'] = '/image?type=4&id=' + facetrack_record.facetrack_id + '&fn=' + facetrack_image.image_name
            facetrack['status'] = facetrack_record.status
            facetrack['createdate'] = facetrack_record.createdate.strftime("%Y-%m-%d %H:%M:%S")
            if facetrack_record.status >= 1:
                person_matched = {}
                person_matched['matched_person_id'] = facetrack_record.matched_person_id
                person_info = PersonInfo.objects.get(id=facetrack_record.matched_person_id)
                person_matched['alarm_level'] = person_info.alarm_level
                person_matched['name'] = person_info.name
                person_matched['gender'] = person_info.gender
                person_matched['id_card'] = person_info.id_card
                person_matched['family_register'] = person_info.family_register
                person_group = PersonGroup.objects.get(id=person_info.group_id)
                person_matched['group_name'] = person_group.group_name
                facetrack['person_matched'] = person_matched
            facetracks.append(facetrack)

        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'facetracks': facetracks,
                'facetracks_total': facetracks_total
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def facetrackAlarm(request):
    if request.method == 'POST':
        src_ids = request.POST.get('src_ids')
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')
        is_processed = request.POST.get('is_processed')
        page = int(request.POST.get('page', 1))
        number = int(request.POST.get('number', 10))
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        id_card = request.POST.get('id_card')
        group_id = request.POST.get('group_id')
        alarm_level = request.POST.get('alarm_level')

        facetracks_alarm = FacetrackInfo.objects.filter(status__gte=1).order_by('-id')
        if src_ids is not None and len(src_ids):
            src_ids = src_ids.split(',')
            facetracks_alarm = facetracks_alarm.filter(src_id__in=src_ids)
        if start_time is not None:
            facetracks_alarm = facetracks_alarm.filter(createdate__gte=start_time)
        if end_time is not None:
            facetracks_alarm = facetracks_alarm.filter(createdate__lte=end_time)
        if is_processed is not None and len(is_processed):
            is_processed = int(is_processed)
            if is_processed == 1:
                facetracks_alarm = facetracks_alarm.filter(status=1)
            elif is_processed == 2:
                facetracks_alarm = facetracks_alarm.filter(status=2)
            else:
                facetracks_alarm = facetracks_alarm.filter(status__gte=1)
        if name is not None and len(name):
            facetracks_alarm = facetracks_alarm.filter(matched_person__name__contains=name)
        if gender is not None and len(gender):
            facetracks_alarm = facetracks_alarm.filter(matched_person__gender=int(gender))
        if id_card is not None and len(id_card):
            facetracks_alarm = facetracks_alarm.filter(matched_person__id_card=id_card)
        if group_id is not None and len(group_id):
            facetracks_alarm = facetracks_alarm.filter(matched_person__group_id=int(group_id))
        if alarm_level is not None and len(alarm_level):
            facetracks_alarm = facetracks_alarm.filter(matched_person__alarm_level=int(alarm_level))
        facetracks_total = facetracks_alarm.count()
        facetracks_alarm = facetracks_alarm[(page - 1) * number:page * number]

        facetracks = []
        for facetrack_alarm in facetracks_alarm:
            facetrack = {}
            facetrack['facetrack_id'] = facetrack_alarm.facetrack_id
            facetrack['age'] = facetrack_alarm.age
            facetrack['glasses'] = facetrack_alarm.glasses
            facetrack['src_id'] = facetrack_alarm.src_id
            camera_info = CameraInfo.objects.get(src_id=facetrack_alarm.src_id)
            facetrack['camera_name'] = camera_info.camera_name
            facetrack_image = FacetrackImage.objects.filter(facetrack_id=facetrack_alarm.facetrack_id).first()
            facetrack[
                'image'] = '/image?type=4&id=' + facetrack_alarm.facetrack_id + '&fn=' + facetrack_image.image_name
            facetrack['scene_image'] = '/image?type=2&id=' + facetrack_alarm.facetrack_id
            facetrack['status'] = facetrack_alarm.status
            facetrack['createdate'] = facetrack_alarm.createdate.strftime("%Y-%m-%d %H:%M:%S")
            person_matched = {}
            person_info = PersonInfo.objects.get(id=facetrack_alarm.matched_person_id)
            person_matched['matched_person_id'] = person_info.person_id
            if facetrack_alarm.matched_score is None:
                person_matched['matched_score'] = 1.0
            else:
                person_matched['matched_score'] = smoothingAlgorithm(facetrack_alarm.matched_score)
            person_matched['alarm_level'] = person_info.alarm_level
            person_matched['name'] = person_info.name
            person_matched['gender'] = person_info.gender
            person_matched['id_card'] = person_info.id_card
            person_matched['family_register'] = person_info.family_register
            person_matched['face_image'] = person_info.face_image
            person_group = PersonGroup.objects.get(id=person_info.group_id)
            person_matched['group_name'] = person_group.group_name
            facetrack['person_matched'] = person_matched
            facetracks.append(facetrack)

        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'facetracks': facetracks,
                'facetracks_total': facetracks_total
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def getFacetrackInfo(request):
    if request.method == 'POST':
        facetrack_id = request.POST.get('facetrack_id')

        facetrack_info = FacetrackInfo.objects.get(facetrack_id=facetrack_id)
        facetrack = {}
        facetrack['facetrack_id'] = facetrack_info.facetrack_id
        facetrack['age'] = facetrack_info.age
        facetrack['sex'] = facetrack_info.sex
        facetrack['glasses'] = facetrack_info.glasses
        facetrack['src_id'] = facetrack_info.src_id
        camera_info = CameraInfo.objects.get(src_id=facetrack_info.src_id)
        facetrack['camera_name'] = camera_info.camera_name
        facetrack['scene_image'] = '/image?type=2&id=' + facetrack_info.facetrack_id
        facetrack['images'] = []
        facetrack_images = FacetrackImage.objects.filter(facetrack_id=facetrack_info.facetrack_id)
        for facetrack_image in facetrack_images:
            facetrack['images'].append(
                '/image?type=4&id=' + facetrack_info.facetrack_id + '&fn=' + facetrack_image.image_name)
        facetrack['status'] = facetrack_info.status
        facetrack['createdate'] = facetrack_info.createdate.strftime("%Y-%m-%d %H:%M:%S")
        if facetrack_info.status >= 1:
            person_matched = {}
            person_info = PersonInfo.objects.get(id=facetrack_info.matched_person_id)
            person_matched['matched_person_id'] = person_info.person_id
            if facetrack_info.matched_score is None:
                person_matched['matched_score'] = 1.0
            else:
                person_matched['matched_score'] = smoothingAlgorithm(facetrack_info.matched_score)
            person_matched['alarm_level'] = person_info.alarm_level
            person_matched['name'] = person_info.name
            person_matched['gender'] = person_info.gender
            person_matched['birthday'] = person_info.birthday
            person_matched['nation'] = person_info.nation
            person_matched['id_card'] = person_info.id_card
            person_matched['family_register'] = person_info.family_register
            person_matched['face_image'] = person_info.face_image
            person_group = PersonGroup.objects.get(id=person_info.group_id)
            person_matched['group_name'] = person_group.group_name
            person_matched['images'] = []
            person_images = PersonImage.objects.filter(person_id=person_info.person_id, isdeleted = 0)
            for person_image in person_images:
                person_matched['images'].append(person_image.face_image)
            facetrack['person_matched'] = person_matched

        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'facetrack': facetrack,
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def facetrackArchive(request):
    if request.method == 'POST':
        option = int(request.POST.get('option'))
        facetrack_id = request.POST.get('facetrack_id')
        person_id = request.POST.get('person_id')

        if option == 1:
            facetrackInfo = FacetrackInfo.objects.get(facetrack_id=facetrack_id)
            recognizeServer = RecognizeServer.objects.get(id=facetrackInfo.recognize_id)

            deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
            response = deepFaceAPI.addfacetracktoperson(facetrack_id, person_id)
            if response['result']['code'] == 0:
                facetrackInfo.status = 2
                facetrackInfo.matched_person = PersonInfo.objects.get(person_id=person_id)
                facetrackInfo.save()
                context = {'code': 0, 'message': 'success'}
            else:
                print(response)
                context = {'code': -3, 'message': 'archive error'}
        elif option == 2:
            facetrackInfo = FacetrackInfo.objects.get(facetrack_id=facetrack_id)
            recognizeServer = RecognizeServer.objects.get(id=facetrackInfo.recognize_id)

            deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
            response = deepFaceAPI.cancelfacetrackfromperson(facetrack_id)
            if response['result']['code'] == 0:
                facetrackInfo.status = 0
                facetrackInfo.matched_person = None
                facetrackInfo.matched_percent = None
                facetrackInfo.matched_score = None
                facetrackInfo.save()
                context = {'code': 0, 'message': 'success'}
            else:
                context = {'code': -3, 'message': 'cancel archive error'}
        else:
            context = {'code': -2, 'message': 'option param invalid'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def matchFacetrackToPerson(request):
    if request.method == 'POST':
        facetrack_id = request.POST.get('facetrack_id')

        facetrackInfo = FacetrackInfo.objects.get(facetrack_id=facetrack_id)
        recognizeServer = RecognizeServer.objects.get(id=facetrackInfo.recognize_id)

        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
        matchTransaction = deepFaceAPI.matchfacetrack2person(facetrack_id, [])
        transactionID = matchTransaction['result']['results']['transId']

        for retryTimes in range(settings.FACETRACK_PERSON_RETRY_TIMES):
            matchResult = deepFaceAPI.getmatchfacetrackresult(facetrack_id, transactionID)
            if matchResult["result"]["msg"] == 'The transaction is on processing':
                if retryTimes == settings.FACETRACK_PERSON_RETRY_TIMES - 1:
                    context = {'code': -2, 'message': 'match facetrack to person timeout'}
                else:
                    time.sleep(settings.FACETRACK_PERSON_RETRY_INTERVAL)
                    continue
            elif matchResult["result"]["msg"] == "SUCC":
                person_matches = []
                matches = matchResult['result']['results']['matchs']
                for match in matches[0:10]:
                    person_match = {}
                    person_match['person_id'] = match['id_person']
                    person_match['score'] = match['score']
                    person_info = PersonInfo.objects.get(person_id=match['id_person'])
                    person_match['name'] = person_info.name
                    person_match['id_card'] = person_info.id_card
                    person_match['face_image'] = person_info.face_image
                    person_matches.append(person_match)

                context = {
                    'code': 0,
                    'message': 'success',
                    'data': {
                        'count': len(person_matches),
                        'person_matches': person_matches
                    }
                }
                break
            else:
                context = {'code': -3, 'message': 'match facetrack to person error'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def personGroup(request):
    if request.method == 'GET':
        query = request.GET.get('q')
        page = request.GET.get('page')
        number = request.GET.get('number')

        person_groups = PersonGroup.objects.all()
        if query is not None and len(query):
            person_groups = person_groups.filter(group_name__contains=query)

        count = len(person_groups)
        if page is not None and len(page) and number is not None and len(number):
            page = int(page)
            number = int(number)
            person_groups = person_groups[(page - 1) * number:page * number]

        groups = []
        for person_group in person_groups:
            group = {}
            group['id'] = person_group.id
            group['name'] = person_group.group_name
            group['remark'] = person_group.remark
            group['count'] = PersonInfo.objects.filter(group_id=person_group.id, isdeleted = 0).count()
            groups.append(group)
        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'count': count,
                'groups': groups
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def createPersonGroup(request):
    if request.method == 'POST':
        group_name = request.POST.get('group_name')
        remark = request.POST.get('remark')

        group = PersonGroup(group_uuid=str(uuid.uuid1()), group_name=group_name, remark=remark)
        group.save()
        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def changePersonGroup(request):
    if request.method == 'POST':
        group_id = request.POST.get('group_id')
        group_name = request.POST.get('group_name')
        remark = request.POST.get('remark')

        group = PersonGroup.objects.get(id=group_id)
        group.group_name = group_name
        group.remark = remark
        group.save()
        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def deletePersonGroup(request):
    if request.method == 'POST':
        group_id = request.POST.get('group_id')

        if PersonInfo.objects.filter(group_id=group_id).exists():
            context = {'code': -2, 'message': 'delete failure'}
        else:
            group = PersonGroup.objects.get(id=group_id)
            group.delete()
            context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def person(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        nation = request.POST.get('nation')
        birthday = request.POST.get('birthday')
        id_card = request.POST.get('id_card')
        family_register = request.POST.get('family_register')
        alarm_level = request.POST.get('alarm_level')
        group_id = request.POST.get('group_id')
        page = int(request.POST.get('page', 1))
        number = int(request.POST.get('number', 10))

        persons = PersonInfo.objects.filter(isdeleted=0).order_by('-id')
        if name is not None and len(name):
            persons = persons.filter(name__contains=name)
        if gender is not None and len(gender):
            persons = persons.filter(gender=int(gender))
        if id_card is not None and len(id_card):
            persons = persons.filter(id_card=id_card)
        if group_id is not None and len(group_id):
            persons = persons.filter(group_id=int(group_id))
        if alarm_level is not None and len(alarm_level):
            persons = persons.filter(alarm_level=int(alarm_level))
        persons_total = persons.count()
        persons = persons[(page - 1) * number:page * number]

        persons_matched = []
        for person in persons:
            person_matched = {}
            person_matched['person_id'] = person.person_id
            person_matched['group_name'] = PersonGroup.objects.get(id = person.group_id).group_name
            person_matched['name'] = person.name
            person_matched['alarm_level'] = person.alarm_level
            person_matched['gender'] = person.gender
            person_matched['birthday'] = person.birthday
            person_matched['id_card'] = person.id_card
            person_matched['nation'] = person.nation
            person_matched['family_register'] = person.family_register
            person_matched['face_image'] = person.face_image
            persons_matched.append(person_matched)

        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'persons_total': persons_total,
                'persons': persons_matched
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def cropFace(request):
    if request.method == 'POST':
        option = request.POST.get('option')
        image = request.POST.get('image')

        crop_path = 'static/Upload/photo/%s.jpg' % uuid.uuid1()
        photo_path = 'static/Upload/photo/src_%s.jpg' % uuid.uuid1()
        with open(photo_path, 'wb+') as destination:
            destination.write(base64.b64decode(image))

        if int(option) == 1:
            x = request.POST.get('x')
            y = request.POST.get('y')
            w = request.POST.get('w')
            h = request.POST.get('h')

            img = Image.open(photo_path)
            crop_img = img.crop((img.size[0] * x, img.size[1] * y, img.size[0] * w + img.size[0] * x, img.size[1] * h + img.size[1] * y))
            crop_img = crop_img.resize((144, 144), Image.ANTIALIAS)
            crop_img.save(crop_path)

            context = {
                'code': 0,
                'message': 'success',
                'data': {
                    'crop_path': '/' + crop_path,
                    'photo_path': '/' + photo_path
                }
            }
        elif int(option) == 2:
            recognizeServer = RecognizeServer.objects.filter(is_enabled = 1).first()
            deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)

            response = deepFaceAPI.cropface(image)
            if response['result']['code'] == 0:
                image_base64 = response['result']['results']['img']
                with open(crop_path, 'wb+') as destination:
                    destination.write(base64.b64decode(image_base64))
                context = {
                    'code': 0,
                    'message': 'success',
                    'data': {
                        'crop_path': '/' + crop_path,
                        'photo_path': '/' + photo_path
                    }
                }
            else:
                context = {'code': -3, 'message': 'no face detected'}
        else:
            context = {'code': -2, 'message': 'option not supported'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def getPersonInfo(request):
    if request.method == 'POST':
        person_id = request.POST.get('person_id')

        person = {}
        person_info = PersonInfo.objects.get(person_id=person_id)
        person['person_id'] = person_info.person_id
        person['alarm_level'] = person_info.alarm_level
        person['name'] = person_info.name
        person['gender'] = person_info.gender
        person['birthday'] = person_info.birthday
        person['nation'] = person_info.nation
        person['id_card'] = person_info.id_card
        person['family_register'] = person_info.family_register
        person['face_image'] = person_info.face_image
        person['phone'] = person_info.phone
        person['remark'] = person_info.remark
        person['created_time'] = person_info.created_time.strftime("%Y-%m-%d %H:%M:%S")
        person['group_id'] = person_info.group_id
        person_group = PersonGroup.objects.get(id=person_info.group_id)
        person['group_name'] = person_group.group_name
        person['images'] = []
        person_images = PersonImage.objects.filter(person_id=person_info.person_id, isdeleted = 0)
        for person_image in person_images:
            person['images'].append({
                'image_id': person_image.image_id,
                'face_image': person_image.face_image
            })

        context = {
            'code': 0,
            'message': 'success',
            'data': {
                'person': person,
            }
        }
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def createPerson(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        nation = request.POST.get('nation')
        birthday = request.POST.get('birthday')
        id_card = request.POST.get('id_card')
        family_register = request.POST.get('family_register')
        phone = request.POST.get('phone')
        remark = request.POST.get('remark')
        alarm_level = request.POST.get('alarm_level')
        face_image = request.POST.get('face_image')
        group_id = request.POST.get('group_id')
        images = request.POST.get('images')

        images_list = []
        if images is not None and len(images):
            images_list = json.loads(images)

        person_id = str(uuid.uuid1())
        person = PersonInfo(
            person_id=person_id,
            name=name,
            gender=gender,
            nation=nation,
            birthday=birthday,
            id_card=id_card,
            family_register=family_register,
            face_image=face_image,
            phone=phone,
            remark=remark,
            alarm_level=alarm_level,
            group_id=group_id)
        person.save()

        for image in images_list:
            person_image = PersonImage(person_id=person_id, image_id = uuid.uuid1(), face_image=image)
            person_image.save()

        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def changePerson(request):
    if request.method == 'POST':
        person_id = request.POST.get('person_id')
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        nation = request.POST.get('nation')
        birthday = request.POST.get('birthday')
        id_card = request.POST.get('id_card')
        family_register = request.POST.get('family_register')
        phone = request.POST.get('phone')
        remark = request.POST.get('remark')
        alarm_level = request.POST.get('alarm_level')
        face_image = request.POST.get('face_image')
        group_id = request.POST.get('group_id')
        images = request.POST.get('images')

        images_list = []
        if images is not None and len(images):
            images_list = json.loads(images)

        person = PersonInfo.objects.get(person_id = person_id)
        person.name = name
        person.gender = gender
        person.nation = nation
        person.birthday = birthday
        person.id_card = id_card
        person.family_register = family_register
        person.phone = phone
        person.remark = remark
        person.alarm_level = alarm_level
        person.face_image = face_image
        person.group_id = group_id
        person.save()

        for image in images_list:
            person_image = PersonImage(person_id=person_id, image_id = uuid.uuid1(), face_image=image)
            person_image.save()

        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def deletePersonImage(request):
    if request.method == 'POST':
        person_id = request.POST.get('person_id')
        image_id = request.POST.get('image_id')

        person_image = PersonImage.objects.get(image_id = image_id)
        person_image.isdeleted = 1
        person_image.save()

        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def deletePerson(request):
    if request.method == 'POST':
        person_id = request.POST.get('person_id')

        person_info = PersonInfo.objects.get(person_id = person_id)
        person_info.isdeleted = 1
        person_info.save()

        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def createPersonFromFacetrack(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        gender = request.POST.get('gender')
        nation = request.POST.get('nation')
        birthday = request.POST.get('birthday')
        id_card = request.POST.get('id_card')
        family_register = request.POST.get('family_register')
        phone = request.POST.get('phone')
        remark = request.POST.get('remark')
        alarm_level = request.POST.get('alarm_level')
        group_id = request.POST.get('group_id')
        facetrack_id = request.POST.get('facetrack_id')

        facetrack_info = FacetrackInfo.objects.get(facetrack_id=facetrack_id)
        recognizeServer = RecognizeServer.objects.get(id=facetrack_info.recognize_id)
        deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)

        person_id = str(uuid.uuid1())
        response = deepFaceAPI.createperson_id(person_id, -1, [])
        if response['result']['code'] == 0:
            addResponse = deepFaceAPI.addfacetracktoperson(facetrack_id, person_id)
            if addResponse['result']['code'] == 0:
                facetrack_image = FacetrackImage.objects.filter(facetrack_id=facetrack_id).first()
                person = PersonInfo(
                    person_id=person_id,
                    name=name,
                    gender=gender,
                    nation=nation,
                    birthday=birthday,
                    id_card=id_card,
                    family_register=family_register,
                    face_image='/image?type=4&id=' + facetrack_id + '&fn=' + facetrack_image.image_name,
                    phone=phone,
                    remark=remark,
                    alarm_level=alarm_level,
                    group_id=group_id)
                person.save()
                context = {'code': 0, 'message': 'success'}
            else:
                context = {'code': -3, 'message': 'add facetrack to person error'}
        else:
            context = {'code': -2, 'message': 'create person error'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context, sort_keys=True), content_type="application/json")


@login_required(login_url='/corsface/login')
def facetrackStatsToday(request):
    if request.method == 'GET':
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        sql = "select Hour(createdate) hour, count(*) from CorsfaceRepo.facetrack_info where Date(createdate) = '%s' group by hour" % today
        keys = list(range(24))
        values = list([0] * 24)
        data = dict(zip(keys, values))
        with connection.cursor() as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
        for result in results:
            data[result[0]] = result[1]
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type="application/json")


@login_required(login_url='/corsface/login')
def facetrackAlarmStatsToday(request):
    if request.method == 'GET':
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        sql = "select person_info.alarm_level, count(*) from facetrack_info, person_info where facetrack_info.createdate >= '%s' and facetrack_info.matched_person_id = person_info.id group by alarm_level" % today
        data = {1: 0, 2: 0, 3: 0, 4: 0}
        with connection.cursor() as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
        for result in results:
            data[result[0]] = result[1]
        context = {'code': 0, 'message': 'success', 'data': data}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type="application/json")


'''设备管理'''


@login_required(login_url='/corsface/login')
def deviceList(request):
    result_camera = CameraInfo.objects.filter(status=1)
    responset_camera = [ob.as_json() for ob in result_camera]
    responset_camera_list = []
    for camera in responset_camera:
        try:
            camera['server_ip'] = camera['capture_url'].split('@')[1]
        except:
            camera['server_ip'] = ''
        responset_camera_list.append(camera)
    result_server = RecognizeServer.objects.filter(status=1)
    responset_server = [ob.as_json() for ob in result_server]

    result_capture = CaptureServer.objects.filter(status=1)
    responset_capture = [ob.as_json() for ob in result_capture]

    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = {'camera': responset_camera_list, 'recognize': responset_server,
                             'capture': responset_capture}
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def getcapture(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = int(request.POST.get("re_id", 0))
        result_capture = CaptureServer.objects.filter(status=1,recognize_id=id)
        responset_capture = [ob.as_json() for ob in result_capture]
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = responset_capture
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required(login_url='/corsface/login')
def getcamera(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = int(request.POST.get("ca_id", 0))
        result_capture = CameraInfo.objects.filter(status=1,capture_id=id)
        responset_capture = [ob.as_json() for ob in result_capture]
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = responset_capture
    return HttpResponse(json.dumps(response_data), content_type="application/json")


'''摄像头管理'''


@login_required(login_url='/corsface/login')
def cameraList(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        cur_page = int(request.POST.get("pageno", 1))
        size_page = int(request.POST.get("pagesize", 13))
        quest = request.POST.get("quest", '')
        group = request.POST.get("group", 0)

        if int(group) > 0:
            if not quest:
                record_list = CameraInfo.objects.filter(group_id=group)
            else:
                record_list = CameraInfo.objects.filter(
                    Q(camera_name__icontains=quest) | Q(capture_url__icontains=quest), group_id=group)
        else:
            if not quest:
                record_list = CameraInfo.objects.all()
            else:
                record_list = CameraInfo.objects.filter(
                    Q(camera_name__icontains=quest) | Q(capture_url__icontains=quest))

        paginator = Paginator(record_list, size_page)
        try:
            contacts = paginator.page(cur_page)
        except (EmptyPage, InvalidPage):
            contacts = paginator.page(paginator.num_pages)
        response = []
        for camera in contacts:
            camera_info = {}
            camera_info['id'] = camera.id
            camera_info['camera_name'] = camera.camera_name
            try:
                camera_info['server_name'] = CaptureServer.objects.filter(id=camera.capture_id).first().server_name
            except:
                camera_info['server_name'] = ''
            try:
                camera_info['group_name'] = CameraGroup.objects.filter(id=camera.group_id).first().group_name
            except:
                camera_info['group_name'] = ''
            camera_info['capture_url'] = camera.capture_url
            camera_info['longitude'] = camera.longitude
            camera_info['latitude'] = camera.latitude
            camera_info['is_enabled'] = camera.is_enabled
            response.append(camera_info)
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
        response_data['allnum'] = len(record_list)
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', '')
        id_list = id.strip(',').split(',')
        if len(id_list) > 0:
            num = CameraInfo.objects.filter(id__in=id_list,is_enabled=1).count()
            if num>0:
                response_data = {'code': -1, 'message': '请先停用，再删除！'}
                return HttpResponse(json.dumps(response_data), content_type="application/json")

            res = CameraInfo.objects.filter(id__in=id_list).delete()
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraGroup(request):
    resultset = CameraGroup.objects.all()
    responset_group = [ob.as_json() for ob in resultset]
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = responset_group
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraCapture(request):
    resultset = CaptureServer.objects.all()
    responset_group = [ob.as_json() for ob in resultset]
    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = responset_group
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['camera_name'] = request.POST.get('camera_name')
        request_data['group_id'] = request.POST.get('group_id')
        request_data['capture_url'] = request.POST.get('capture_url')
        request_data['debug_url'] = request.POST.get('debug_url')
        request_data['display_url'] = request.POST.get('display_url')
        request_data['longitude'] = round(float(request.POST.get('longitude', 0)), 2)
        request_data['latitude'] = round(float(request.POST.get('latitude', 0)), 2)
        request_data['capture_id'] = request.POST.get('capture_id')
        request_data['remark'] = request.POST.get('remark')
        request_data['created_time'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
        if int(id) > 0:
            res = CameraInfo.objects.filter(id=id).update(**request_data)
        else:
            res = CameraInfo.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'
    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = CameraInfo.objects.select_related().defer("group", "capture").filter(id=post_id)
            responset_camera = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = responset_camera
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def cameraSaveEnable(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', 0)
        state = request.POST.get('state', 0)
        if int(id) > 0:
            cursor = connection.cursor()
            # 数据检索操作,不需要提交
            cursor.execute('SELECT c.deepface_url,c.appkey FROM camera_info as a left join capture_server as b on a.capture_id=b.id \
                           left JOIN recognize_server as c on c.id=b.recognize_id where a.id = %s', [id])
            data_row = cursor.fetchone()

            res = CameraInfo.objects.filter(id=id).first()
            deepFaceAPI = DeepFaceAPI(data_row[0], data_row[1])
            response = deepFaceAPI.changesourcestate(res.src_id)

            if response['result']['code'] == 0:
                res.is_enabled = 0 if int(state) == 1 else 1
                res.save()
                response_data['code'] = 0
                response_data['message'] = 'success'
            else:
                response_data['code'] = -1
                response_data['message'] = response['result']['msg']

    return HttpResponse(json.dumps(response_data), content_type="application/json")


'''采集端管理'''


@login_required(login_url='/corsface/login')
def captureVersion(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        resultset = CaptureVersion.objects.all()
        response = [ob.as_json() for ob in resultset]
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def captureList(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        cur_page = int(request.POST.get("pageno", 1))
        size_page = int(request.POST.get("pagesize", 13))
        quest = request.POST.get("quest", '')
        group = request.POST.get("group", 0)

        if int(group) > 0:
            if not quest:
                record_list = CaptureServer.objects.filter(recognize_id=group)
            else:
                record_list = CaptureServer.objects.filter(
                    Q(server_name__icontains=quest) | Q(server_ip__icontains=quest), recognize_id=group)
        else:
            if not quest:
                record_list = CaptureServer.objects.all()
            else:
                record_list = CaptureServer.objects.filter(Q(server_name__icontains=quest) | Q(server_ip__icontains=quest))

        paginator = Paginator(record_list, size_page)
        try:
            contacts = paginator.page(cur_page)
        except (EmptyPage, InvalidPage):
            contacts = paginator.page(paginator.num_pages)
        response = []
        for capture in contacts:
            capture_info = {}
            capture_info['id'] = capture.id
            capture_info['server_name'] = capture.server_name
            capture_info['server_ip'] = capture.server_ip
            capture_info['server_flag'] = capture.server_flag
            capture_info['recogize'] = capture.recognize.server_name
            capture_info['state'] = 1
            response.append(capture_info)
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
        response_data['allnum'] = len(record_list)
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def captureSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['server_name'] = request.POST.get('server_name')
        request_data['server_ip'] = request.POST.get('server_ip')
        request_data['server_flag'] = request.POST.get('server_flag')
        request_data['remark'] = request.POST.get('remark')
        request_data['version_id'] = request.POST.get('version_id')
        request_data['recognize_id'] = request.POST.get('recognize_id')
        request_data['created_time'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
        if id and int(id) > 0:
            res = CaptureServer.objects.filter(id=id).update(**request_data)
        else:
            res = CaptureServer.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'
    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = CaptureServer.objects.select_related().defer("version", "recognize").filter(id=post_id)
            responset_camera = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = responset_camera
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def captureDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', '')
        id_list = id.strip(',').split(',')
        if len(id_list) > 0:
            num=CameraInfo.objects.filter(capture_id__in=id_list).count()
            if num>0:
                response_data = {'code': -1, 'message': '请先删除所属的摄像头'}
                return HttpResponse(json.dumps(response_data), content_type="application/json")
            res = CaptureServer.objects.filter(id__in=id_list).delete()
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def captureEnable(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['is_enabled'] = 0 if int(request.POST.get('state', 0)) == 1 else 1
        if int(id) > 0:
            res = CaptureServer.objects.filter(id=id).update(**request_data)
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'

    return HttpResponse(json.dumps(response_data), content_type="application/json")


'''识别端管理'''

@login_required(login_url='/corsface/login')
def recognizeAll(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        resultset = RecognizeServer.objects.all()
        response = [ob.as_json() for ob in resultset]
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeVersion(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        resultset = RecognizeVersion.objects.all()
        response = [ob.as_json() for ob in resultset]
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeList(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        cur_page = int(request.POST.get("pageno", 1))
        size_page = int(request.POST.get("pagesize", 13))
        quest = request.POST.get("quest", '')
        if not quest:
            record_list = RecognizeServer.objects.all()
        else:
            record_list = RecognizeServer.objects.filter(
                Q(server_name__icontains=quest) | Q(appkey__icontains=quest))

        paginator = Paginator(record_list, size_page)
        try:
            contacts = paginator.page(cur_page)
        except (EmptyPage, InvalidPage):
            contacts = paginator.page(paginator.num_pages)
        response = []
        for capture in contacts:
            capture_info = {}
            capture_info['id'] = capture.id
            capture_info['server_name'] = capture.server_name
            capture_info['server_ip'] = capture.server_ip
            capture_info['deepface_url'] = capture.deepface_url
            capture_info['appkey'] = capture.appkey
            capture_info['is_enabled'] = capture.is_enabled
            capture_info['state'] = 1
            response.append(capture_info)
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = response
        response_data['allnum'] = len(record_list)
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', 0)
        if int(id) > 0:
            num = CaptureServer.objects.filter(recognize_id=id).count()
            if num>0:
                response_data = {'code': -1, 'message': '请先删除包含的采集端！'}
                return HttpResponse(json.dumps(response_data), content_type="application/json")

            res = RecognizeServer.objects.filter(id=id).delete()
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['server_name'] = request.POST.get('server_name')
        request_data['appkey'] = request.POST.get('keycode')
        request_data['remark'] = request.POST.get('remark')
        request_data['version_id'] = request.POST.get('version_id')
        request_data['created_time'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
        request_data['deepface_url'] = request.POST.get('deepfaceurl')
        if id and int(id) > 0:
            res = RecognizeServer.objects.filter(id=id).update(**request_data)
        else:
            res = RecognizeServer.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'
    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = RecognizeServer.objects.select_related().defer("version").filter(id=post_id)
            responset_camera = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = responset_camera
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeEnable(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', 0)
        state = request.POST.get('state', 0)
        if int(id) > 0:
            res = RecognizeServer.objects.filter(id=id).first()
            deepFaceAPI = DeepFaceAPI(res.deepface_url, res.appkey)
            if int(state) == 1:
                response = deepFaceAPI.deactiveapp()
            else:
                response = deepFaceAPI.activeapp()

            if response['result']['code'] == 0:
                res.is_enabled = 0 if int(state) == 1 else 1
                res.save()
                response_data['code'] = 0
                response_data['message'] = 'success'
            else:
                response_data['code'] = -1
                response_data['message'] = response['result']['msg']

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def recognizeSync(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', 0)
        resultset = RecognizeServer.objects.select_related().defer("version").filter(id=id).first()
        if int(resultset.is_enabled)==0:
            response_data = {'code': -1, 'message': '请先添加启用识别端！'}
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        recognize_id=resultset.id

        deepFaceAPI = DeepFaceAPI(resultset.deepface_url, resultset.appkey)
        # 获取区域
        response = deepFaceAPI.getareas()
        if response['result']['code'] == 0:
            areaslist = response['result']['results']['areas']
            if len(areaslist) == 0:
                response_data = {'code': -1, 'message': '请先添加设备信息'}
                return HttpResponse(json.dumps(response_data), content_type="application/json")

            deviceslist = []
            # 获取设备采集端
            for x in areaslist:
                response_devices = deepFaceAPI.getdevices(x['id_area'])
                if response_devices['result']['code'] != 0:
                    response_data = {'code': -1, 'message': '设备信息异常，请重新同步'}
                    return HttpResponse(json.dumps(response_data), content_type="application/json")
                else:
                    if len(response_devices['result']['results']['devices']) > 0:
                        deviceslist.extend(response_devices['result']['results']['devices'])

            # 获取已经同步的采集端和摄像头
            Capture_list=CaptureServer.objects.all().values_list('keycode','version_id')
            keycode_list=[x[0] for x in Capture_list]
            version_id=Capture_list[0][1]
            Camera_list = CameraInfo.objects.all().values_list('src_id')
            src_id_list = [x[0] for x in Camera_list]


            querysetlist=[]
            cameralist=[]
            for  devices_one in  deviceslist:
                response_sources = deepFaceAPI.getsources(devices_one['id_device'])
                if response_sources['result']['code'] != 0:
                    response_data = {'code': -1, 'message': '摄像头异常，请重新同步'}
                    return HttpResponse(json.dumps(response_data), content_type="application/json")

                else:
                    if len(response_sources['result']['results']['sources']) > 0:
                        sources_list=response_sources['result']['results']['sources']
                        for sources_one in sources_list:
                            sources_one['id_device']=devices_one['id_device']
                            cameralist.append(sources_one)
                if devices_one['id_device'] not in keycode_list:
                    querysetlist.append(CaptureServer(
                        server_name=devices_one['description'],
                        keycode=devices_one['id_device'],
                        server_flag=devices_one['validstring'],
                        remark=devices_one['description'],
                        recognize_id=recognize_id,
                        version_id=version_id,
                        created_time=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
                    ))
            # 同步采集端入库
            if len(querysetlist)>0:
                res=CaptureServer.objects.bulk_create(querysetlist)
                if not res:
                    response_data = {'code': -1, 'message': '同步采集端失败'}
                    return HttpResponse(json.dumps(response_data), content_type="application/json")

            result=CaptureServer.objects.all().values_list('id','keycode')
            keycode_dice={}
            for i in result:
                keycode_dice[i[1]]=i[0]

            querysetlist_camera=[]
            for camrea_one in cameralist:
                camrea_config=json.loads(re.sub('/\*(.|\n)*\*/', '', camrea_one['config']))
                print(camrea_config['IPCameraParam']['url'])
                if camrea_one['id_src'] not in src_id_list:
                    querysetlist_camera.append(CameraInfo(
                        camera_name=camrea_one['description'],
                        capture_id=keycode_dice[camrea_one['id_device']],
                        src_id=camrea_one['id_src'],
                        remark=camrea_one['description'],
                        longitude=0,
                        latitude=0,
                        capture_url=camrea_config['IPCameraParam']['url'],
                        debug_url=camrea_config['IPCameraParam']['url'],
                        display_url=camrea_config['IPCameraParam']['url'],
                        is_enabled=1,
                        created_time=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
                    ))
            if len(querysetlist_camera) > 0:
                res = CameraInfo.objects.bulk_create(querysetlist_camera)
                if not res:
                    response_data = {'code': -1, 'message': '同步摄像头失败'}
                    return HttpResponse(json.dumps(response_data), content_type="application/json")
            response_data['code'] = 0
            response_data['message'] = 'success'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
