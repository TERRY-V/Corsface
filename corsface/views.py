# -*- coding: utf-8 -*-

import base64
import os
import json
import uuid
import requests
import sys
import time
import datetime

from datetime import datetime, timedelta

from django.conf import settings
from django.contrib import auth
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site

from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.db import connection
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
from deepface.models import *

from system.models import SystemConfig


def login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/corsface/')
    else:
        config = SystemConfig.objects.first()
        return render(request, 'corsface/login.html', {'config': config})


@login_required(login_url='/corsface/login')
def main(request):
    config = SystemConfig.objects.first()
    return render(request, 'corsface/default.html', {'config': config})


@login_required(login_url='/corsface/login')
def index(request):
    return render(request, 'corsface/index.html', {})


@login_required(login_url='/corsface/login')
def alarmRecord(request):
    return render(request, 'corsface/alarm/alarmrecord.html')


@login_required(login_url='/corsface/login')
def alarminfo(request):
    return render(request, 'corsface/alarm/alarminfo.html')


@login_required(login_url='/corsface/login')
def facerecord(request):
    return render(request, 'corsface/faceinfo/facerecord.html')


@login_required(login_url='/corsface/login')
def faceinfo(request):
    return render(request, 'corsface/faceinfo/faceinfo.html')


@login_required(login_url='/corsface/login')
def websocket(request):
    return render(request, 'corsface/websocket.html')


@login_required(login_url='/corsface/login')
def menumanager(request):
    return render(request, 'corsface/menumanager/menumanager.html')


@login_required(login_url='/corsface/login')
def vediosetting(request):
    return render(request, 'corsface/vedio/v310_vediosetting.html')


@login_required(login_url='/corsface/login')
def trackdetail(request):
    return render(request, 'corsface/faceinfo/v310_trackdetail.html')


@login_required(login_url='/corsface/login')
def details(request):
    return render(request, 'corsface/details.html')


@login_required(login_url='/corsface/login')
def map(request):
    return render(request, 'corsface/map/v310_map.html')

@login_required(login_url='/corsface/login')
def offline_map(request):
    return render(request, 'corsface/map/v310_offLineMap.html')


@login_required(login_url='/corsface/login')
def persongroup(request):
    return render(request, 'corsface/persongroup/v310_persongrouplist.html')

@login_required(login_url='/corsface/login')
def personlist(request):
    return render(request, 'corsface/person/v310_personlist.html')
@login_required(login_url='/corsface/login')
def personform(request):
    return render(request, 'corsface/person/v310_personform.html')
@login_required(login_url='/corsface/login')
def persondeploy(request):
    return render(request, 'corsface/persondeploy/v310_persondeploy.html')
@login_required(login_url='/corsface/login')
def personcreate_by_track(request):
    return render(request, 'corsface/person/v310_personcreate_by_track.html')

@login_required(login_url='/corsface/login')
def persontrack(request):
    return render(request, 'corsface/person/v310_persontrack.html')
@login_required(login_url='/corsface/login')
def facetracksearch(request):
    return render(request, 'corsface/search/v310_facetrack_search.html')


def help(request):
    return render(request, 'corsface/help/help.html')


@login_required(login_url='/corsface/login')
def mapshow(request):
    return render(request, 'corsface/setmap/mapshow.html')


@login_required(login_url='/corsface/login')
def mapchoose(request):
    return render(request, 'corsface/setmap/mapchoose.html')


@login_required(login_url='/corsface/login')
def getpersoninfo(request):
    return render(request, 'corsface/faceinfo/persondetail.html')


@login_required(login_url='/corsface/login')
def systemdevice(request):
    return render(request, 'corsface/deepface/device.html')


@login_required(login_url='/corsface/login')
def systemcamera(request):
    return render(request, 'corsface/deepface/camera.html')


@login_required(login_url='/corsface/login')
def camerasetting(request):
    return render(request, 'corsface/deepface/camerasetting.html')


@login_required(login_url='/corsface/login')
def camerasave(request, second_param):
    print(second_param)
    result=CameraInfo.objects.filter(id=second_param).first()
    response_data = {
        'data_list': result,
    }
    return render(request, 'corsface/deepface/camerasave.html',response_data)


@login_required(login_url='/corsface/login')
def systemcapture(request):
    return render(request, 'corsface/deepface/capture.html')


@login_required(login_url='/corsface/login')
def systemrecognize(request):
    return render(request, 'corsface/deepface/recognize.html')


@login_required(login_url='/corsface/login')
def usermanagerlist(request):
    return render(request, 'corsface/usermanager/usermanagelist.html')


@login_required(login_url='/corsface/login')
def usermanagerform(request):
    return render(request, 'corsface/usermanager/usermanageform.html')


@login_required(login_url='/corsface/login')
def commonuserdelect(request):
    return render(request, 'corsface/rolemanager/commonuserdelect.html')


@login_required(login_url='/corsface/login')
def roleform(request):
    return render(request, 'corsface/rolemanager/roleform.html')


@login_required(login_url='/corsface/login')
def rolelist(request):
    return render(request, 'corsface/rolemanager/rolelist.html')


@login_required(login_url='/corsface/login')
def roleselectmune(request):
    return render(request, 'corsface/rolemanager/roleselectmune.html')


@login_required(login_url='/corsface/login')
def roleselectuser(request):
    return render(request, 'corsface/rolemanager/roleselectuser.html')

@login_required(login_url='/corsface/login')
def analysis(request):
    return render(request, 'corsface/statistics/v310_statistic.html')
@login_required(login_url='/corsface/login')
def search(request):
    return render(request, 'corsface/search/v310_search.html')
