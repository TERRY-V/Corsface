import json
import logging
import time
import traceback
import base64

from channels import Channel, Group
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta

from deepface.models import *
from deepface.deepfaceapi import DeepFaceAPI
from deepface.smoothing import smoothingAlgorithm
from system.models import SystemConfig

def ws_connect_consumer(message):
    message.reply_channel.send({"accept": True})
    Group(settings.GROUP_FACETRACK_WEBSOCKET).add(message.reply_channel)

def ws_receive_consumer(message):
    print(message)

def ws_disconnect_consumer(message):
    Group(settings.GROUP_FACETRACK_WEBSOCKET).discard(message.reply_channel)

def facetrack_created_consumer(message):
    facetrackInfo = message["facetrackInfo"]

    try:
        facetrack_id = facetrackInfo["uuid"]
        age = facetrackInfo["age"]
        glasses = facetrackInfo["glasses"]
        sex = facetrackInfo["sex"]
        src_id = facetrackInfo["src_id"]
        descriptor = facetrackInfo["descriptor"]
        state = facetrackInfo["state"]
        createdate = facetrackInfo["createdate"]
        imgs = facetrackInfo["imgs"]
    except:
        traceback.print_exc()
        return None

    facetrackInfoObject = FacetrackInfo(facetrack_id = facetrack_id, 
        age = age, 
        glasses = glasses,
        sex = sex,
        src_id = src_id,
        descriptor = descriptor,
        state = state,
        createdate = createdate)

    cameraInfo = CameraInfo.objects.get(src_id = src_id)
    captureServer = CaptureServer.objects.get(id = cameraInfo.capture_id)
    recognizeServer = RecognizeServer.objects.get(id = captureServer.recognize_id)

    facetrackInfoObject.recognize_id = recognizeServer.id

    deepFaceAPI = DeepFaceAPI(recognizeServer.deepface_url, recognizeServer.appkey)
    matchTransaction = deepFaceAPI.matchfacetrack2person(facetrack_id, [])
    transactionID = matchTransaction['result']['results']['transId']

    systemConfig = SystemConfig.objects.get(id=1)
    for retryTimes in range(settings.FACETRACK_PERSON_RETRY_TIMES):
        matchResult = deepFaceAPI.getmatchfacetrackresult(facetrack_id, transactionID)
        if matchResult["result"]["msg"] == 'The transaction is on processing':
            if retryTimes == settings.FACETRACK_PERSON_RETRY_TIMES - 1:
                facetrackInfoObject.status = -1
            else:
                time.sleep(settings.FACETRACK_PERSON_RETRY_INTERVAL)
                continue
        elif matchResult["result"]["msg"] == "SUCC":
            if len(matchResult["result"]["results"]["matchs"]):
                firstMatch = matchResult["result"]["results"]["matchs"][0]
                if smoothingAlgorithm(firstMatch['score']) >= systemConfig.alert_weight/100.0:
                    facetrackInfoObject.status = 1
                    facetrackInfoObject.matched_person = PersonInfo.objects.get(person_id = firstMatch['id_person'])
                    facetrackInfoObject.matched_percent = firstMatch['percent']
                    facetrackInfoObject.matched_score = firstMatch['score']
                elif smoothingAlgorithm(firstMatch['score']) >= 0.35:
                    facetrackInfoObject.status = 0
                    facetrackInfoObject.matched_person = PersonInfo.objects.get(person_id = firstMatch['id_person'])
                    facetrackInfoObject.matched_percent = firstMatch['percent']
                    facetrackInfoObject.matched_score = firstMatch['score']
                else:
                    facetrackInfoObject.status = 0
            else:
                facetrackInfoObject.status = 0
            break
    facetrackInfoObject.save()

    for facetrack_image in imgs:
        image_name = facetrack_image["fn"]
        image_quality = facetrack_image["quality"]
        FacetrackImage.objects.create(facetrack_id = facetrack_id,
            image_name = image_name,
            image_quality = image_quality)

    messageObject = {}
    messageObject['facetrack_id'] = facetrack_id
    messageObject['age'] = age
    messageObject['glasses'] = glasses
    messageObject['src_id'] = src_id
    messageObject['camera_name'] = cameraInfo.camera_name
    messageObject['image'] = '/image?type=4&id=' + facetrack_id + '&fn=' + imgs[0]["fn"]
    messageObject['scene_image'] = '/image?type=2&id=' + facetrack_id
    messageObject['createdate'] = createdate
    messageObject['status'] = facetrackInfoObject.status
    if facetrackInfoObject.status >= 0 and facetrackInfoObject.matched_person_id is not None:
        person_matched = {}
        person_info = PersonInfo.objects.get(id = facetrackInfoObject.matched_person_id)
        person_matched['matched_person_id'] = person_info.person_id
        person_matched['matched_score'] = smoothingAlgorithm(facetrackInfoObject.matched_score)
        person_matched['alarm_level'] = person_info.alarm_level
        person_matched['name'] = person_info.name
        person_matched['gender'] = person_info.gender
        person_matched['id_card'] = person_info.id_card
        person_matched['face_image'] = person_info.face_image
        person_matched['family_register'] = person_info.family_register
        person_group = PersonGroup.objects.get(id = person_info.group_id)
        person_matched['group_name'] = person_group.group_name
        messageObject['person_matched'] = person_matched

    print('Facetrack Created:')
    print(json.dumps(messageObject, ensure_ascii=False, indent=4))
    Group(settings.GROUP_FACETRACK_WEBSOCKET).send({"text": json.dumps(messageObject)})


def facetrack_appended_consumer(message):
    facetrackInfo = message["facetrackInfo"]
    try:
        facetrack_id = facetrackInfo["uuid"]
        imgs = facetrackInfo["imgs"]
    except:
        traceback.print_exc()
        return None

    images_existed = FacetrackImage.objects.filter(facetrack_id = facetrack_id).count()
    for facetrack_image in imgs[images_existed:]:
        image_name = facetrack_image["fn"]
        image_quality = facetrack_image["quality"]
        FacetrackImage.objects.create(facetrack_id = facetrack_id,
            image_name = image_name,
            image_quality = image_quality)

    print('Facetrack Appended')
    print(json.dumps(facetrackInfo, ensure_ascii=False, indent=4))


def person_synchronize_consumer(message):
    option = int(message["option"])
    print('Person synchronized!')
    if option == 1:
        persons = PersonDeploy.objects.filter(status = 0)
        for person in persons:
            try:
                int_id = person.deployed_person_id
                deepFaceAPI = DeepFaceAPI(person.recognize.deepface_url, person.recognize.appkey)

                person_info = PersonInfo.objects.get(id = int_id)
                person_id = person_info.person_id
                group_uuid = PersonGroup.objects.get(id = person_info.group_id).group_uuid
                sex = person_info.gender
                sex -= 1 if sex == 1 or sex == 2 else -1
                images = PersonImage.objects.filter(person_id = person_id).values_list("face_image", flat = True)

                response = deepFaceAPI.createperson_id(person_id, sex, [group_uuid])
                if response['result']['msg'] == 'SUCC':
                    print("create person succeed")
                    for image_url in images:
                        fr = open(image_url[1:], 'rb')
                        image =base64.b64encode(fr.read())
                        fr.close()
                        response2 = deepFaceAPI.addimgtoperson(str(image, "utf-8"), person_id)
                    PersonDeploy.objects.filter(deployed_person_id = int_id).update(status = 1)
                else:
                    deepFaceAPI.deleteperson(person_id)
                    print("delete ing ..")
                    PersonDeploy.objects.filter(deployed_person_id = int_id).update(status = -1)
            except:
                traceback.print_exc()
                time.sleep(2)
                continue
        #if PersonDeploy.objects.filter(status = 0).count() != 0:
        #    time.sleep(1)
        #    person_synchronize_consumer({'option': 1})
        #if PersonDeploy.objects.filter(status = -1).count != 0:
        #    PersonDeploy.objects.filter(status = -1).update(status = 0)
        #    person_synchronize_consumer({'option': 1})
    elif option == 2:
        PersonDeploy.objects.filter(status = -1).update(status = 0)
        person_synchronize_consumer({'option': 1})
    else:
        print("message eroor ", option)

