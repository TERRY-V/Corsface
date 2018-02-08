# -*- coding: utf-8 -*-

import base64
import os
import json
import uuid
import datetime
import requests
import sys

from datetime import datetime, timedelta

from django.conf import settings

from django.conf import settings
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site

from django.db import connection
from django.http import HttpResponse, Http404

from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.shortcuts import render

from django.template.defaulttags import register
from django.utils.http import (base36_to_int, is_safe_url, urlsafe_base64_decode, urlsafe_base64_encode)
from django.views.generic import View

from deepface.models import *
from deepface.deepfaceapi import *


import os

prefix_dict = {
    '0':'Face',
    '2':'Scene',
    '4':'BigFace'
}

def showImage(request):
    if request.method == 'GET':
        image_type_string = request.GET.get('type')
        id = request.GET.get('id')
        fn = request.GET.get('fn', '')

        image_type = int(image_type_string)

        if image_type in [0, 2, 4]:
            path = 'static/Facetrack/' + prefix_dict[image_type_string] + '/' + id + '.jpg'
            if settings.CACHE_IMAGE_ENABLED == 1 and os.path.exists(path):
                f = open(path, 'rb')
                img = f.read()
                f.close()
                return HttpResponse(img ,content_type = 'image/jpeg')
            else:
                facetrack_info = FacetrackInfo.objects.get(facetrack_id = id)
                recognizeServer = RecognizeServer.objects.get(id = facetrack_info.recognize_id)

                deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
                response = deepFaceAPI.getsingleimg(image_type, id, fn)
                if response['result']['code'] == 0:
                    img = response['result']['results']['img']
                    f = open(path,'wb')
                    f.write(base64.b64decode(img))
                    f.close()
                    return HttpResponse(base64.decodestring(bytes(response['result']['results']['img'], 'utf-8')), content_type='image/jpeg')
        elif image_type == 1:
            return redirect(fn)
        else:
            return None

