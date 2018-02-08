# -*- coding: utf-8 -*-

import os
import json
import uuid
import datetime
import requests
import sys
import time

from channels import Channel

from django.conf import settings
from django.contrib import auth
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def newFacetrack(request):
    if request.method == "GET":
        return HttpResponse("GET method not supported!")

    requestJson = json.loads(request.body.decode())
    messageType = requestJson["params"]["value"]["type"]
    if messageType == "FaceTrackCreated":
        facetrackInfo = requestJson["params"]["value"]["info"]
        # print(messageType)
        # print(json.dumps(facetrackInfo, ensure_ascii=False, indent=4))
        Channel(settings.CHANNEL_FACETRACK_CREATED).send({"facetrackInfo": facetrackInfo})
    elif messageType == "FaceTrackAppended":
        facetrackInfo = requestJson["params"]["value"]["info"]
        # print(messageType)
        # print(json.dumps(facetrackInfo, ensure_ascii=False, indent=4))
        Channel(settings.CHANNEL_FACETRACK_APPENDED).send({"facetrackInfo": facetrackInfo})
    else:
        # print(messageType)
        # print(json.dumps(requestJson, ensure_ascii=False, indent=4))
        pass

    response = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "code": 0,
            "msg": "SUCC",
            "results": {
            }
        }
    }
    return HttpResponse(json.dumps(response), content_type="application/json")


@csrf_exempt
def synchronize(request):
    if request.method == 'POST':
        option = request.POST.get('option')
        Channel(settings.CHANNEL_PERSON_SYNCHRONIZE).send({"option": option})
        context = {'code': 0, 'message': 'success'}
    else:
        context = {'code': -1, 'message': 'method not supported'}
    return HttpResponse(json.dumps(context), content_type="application/json")

