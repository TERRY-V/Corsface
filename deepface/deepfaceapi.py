# -*- coding:utf-8 -*-
import json
from queue import Queue
import requests
from django.conf import settings

class RequestsPool(object):

    def __init__(self, num):
        self.num = num
        self.session_queue = Queue(0)
        for i in range(self.num):
            self.session_queue.put(requests.session())

    def get(self):
        if not self.session_queue.qsize():
            self.session_queue.put(requests.session())
        return self.session_queue.get()

    def free(self, sess):
        self.session_queue.put(sess)

class DeepFaceAPI(object):

    def __init__(self, api_url, app_key):
        self.api_url = api_url
        self.app_key = app_key
        self.requests_pool = RequestsPool(3)

    def send(self, method, params):
        headers = {
            "content-type": "application/json",
            #'Connection': 'close'
        }
        data_send = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": method,
            "params": params
        }
        s = self.requests_pool.get()
        resp = s.post(self.api_url,
                             data=json.dumps(data_send),
                             headers=headers,
                      timeout=10)
        resp_data = resp.text.replace(".,",",")
        self.requests_pool.free(s)
        return json.loads(resp_data)

    #-------------------FaceTrack相关API----------------------#
    #获取未处理的FaceTrack列表
    def getunprocessedfacetrack(self, count):
        method = "getunprocessedfacetrack"
        params = {
            "appkey": self.app_key,
            "count": count
        }
        return self.send(method, params)

    def test_getunprocessedfacetrack(self):
        result = self.getunprocessedfacetrack(5)
        print("*"*20, "test_getunprocessedfacetrack", "*"*20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #获取未处理但已自动匹配的FaceTrack列表
    def getunprocessedmatchedfacetrack(self, count, match_count):
        method = "getunprocessedmatchedfacetrack"
        params = {
            "appkey": self.app_key,
            "count": count,
            "matched_count": match_count
        }
        return self.send(method, params)

    def test_getunprocessedmatchedfacetrack(self):
        result = self.getunprocessedmatchedfacetrack(5, 5)
        print("*" * 20, "test_getunprocessedmatchedfacetrack", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #确认接收FaceTrack
    def ackfacetrack(self, id):
        method = "ackfacetrack"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)

    def test_ackfacetrack(self):
        pass

    #确认接收所有FaceTrack
    def ackallfacetrack(self):
        method = "ackallfacetrack"
        params = {
            "apppkey": self.app_key,
        }
        return self.send(method, params)

    def test_ackallfacetrack(self):
        pass

    #获取FaceTrack列表
    def searchfacetracks(self, group_id, sort_order):
        method = "searchfacetracks"
        if sort_order==1:
            order = "asc"
        else:
            order = "desc"
        params = {
            "appkey": self.app_key,
            "inputs": {
                "uuid": "",
                "sort_value": 0,
                "sort_order": "",
                "groupno": group_id,
                "order": order
            }
        }
        return self.send(method, params)

    def test_searchfacetrack(self):
        print(self.searchfacetrack(1, 0))

    #获取Person列表
    def searchpersons(self, group_id):
        method = "searchpersons"
        params = {
            "appkey": self.app_key,
            "inputs": {
                "uuid": "",
                "groupno": group_id
            }
        }
        return self.send(method, params)

    def test_searchpersons(self):
        print(self.searchpersons(1))

    #获取FaceTrack详细信息
    def getfacetrackinfo(self, id):
        method = "getfacetrackinfo"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)
    def test_getfacetrackinfo(self):
        facetrack_id = "ca59e752-dd96-4271-a715-684e20f89b44"
        result = self.getfacetrackinfo(facetrack_id)
        print("*" * 20, "test_getfacetrackinfo", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #删除FaceTrack中的某个图片
    def deletefacetrackimg(self, id, img):
        method = "deletefacetrackimg"
        params = {
            "appkey": self.app_key,
            "id": id,
            "img": img
        }
        return self.send(method, params)
    def test_deletefacetrackimg(self):
        pass

    #删除FaceTrack
    def deletefacetrack(self, id):
        method = "deletefacetrack"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)
    def test_deletefacetrack(self):
        pass

    #FaceTrack与Person一对一匹配
    def matchfacetrack2singleperson(self, id_facetrack, id_person):
        method = "matchfacetrack2singleperson"
        params = {
            "appkey": self.app_key,
            "id_facetrack": id_facetrack,
            "id_person": id_person
        }
        return self.send(method, params)

    def test_matchfacetrack2singleperson(self):
        id_facetrack = "a77d2ad0-1551-4c21-9ea3-7fb40f739b39"
        id_person = "f0f42b82-c7fd-44b7-ba3d-e0c71b3a48a4"
        result = self.matchfacetrack2singleperson(id_facetrack, id_person)
        print("*" * 20, "test_matchfacetrack2singleperson", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #在Person中匹配FaceTrack
    def matchfacetrack2person(self, id, groups):
        method = "matchfacetrack2person"
        params = {
            "appkey": self.app_key,
            "id": id,
            "info": {
                "groups": groups
            }
        }
        return self.send(method, params)

    def test_matchfacetrack2person(self):
        id = "0f838d82-fabd-4189-8cc1-60922f5cd762"
        src_ids = []
        result = self.matchfacetrack2person(id, src_ids)
        print("*" * 20, "test_matchfacetrack2person", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #获取FaceTrack匹配结果
    def getmatchfacetrackresult(self, id_facetrack, id_trans):
        method = "getmatchfacetrackresult"
        params = {
            "appkey": self.app_key,
            "id_facetrack": id_facetrack,
            "id_trans": id_trans
        }
        return self.send(method, params)

    def test_getmatchfacetrackresult(self):
        id_facetrack = "0f838d82-fabd-4189-8cc1-60922f5cd762"
        id_trans = "a8272cd8-cca9-48aa-80b7-438620929a6e"
        result = self.getmatchfacetrackresult(id_facetrack, id_trans)
        print("*" * 20, "test_getmatchfacetrackresult", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #在Person中匹配FaceTrack（同步）
    def matchfacetrack2person_sync(self, id, src_ids):
        method = "matchfacetrack2person_sync"
        params = {
            "appkey": self.app_key,
            "id": id,
            "src_ids": src_ids
        }
        return self.send(method, params)

    def test_matchfacetrack2person_sync(self):
        id = "a77d2ad0-1551-4c21-9ea3-7fb40f739b39"
        src_ids = []
        result = self.matchfacetrack2person_sync(id, src_ids)
        print("*" * 20, "test_matchfacetrack2person_sync", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #在其他FaceTrack集合中匹配某一FaceTrack
    def matchfacetrack2facetrack(self, id, info):
        method = "matchfacetrack2facetrack"
        params = {
            "appkey": self.app_key,
            "id": id,
            "info": info 
        }
        return self.send(method, params)

    def test_matchfacetrack2facetrack(self):
        id = "565cbff5-f156-4933-9ed6-6b94d4cdf992"
        src_ids = []
        result = self.matchfacetrack2facetrack(id, src_ids)
        print("*" * 20, "test_matchfacetrack2facetrack", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #获取上一匹配的结果
    def getmatchfacetrack2facetrackresult(self, id_trans, id_facetrack):
        method = "getmatchfacetrack2facetrackresult"
        params = {
            "appkey": self.app_key,
            "id_trans": id_trans,
            "id_facetrack": id_facetrack
        }
        return self.send(method, params)

    def test_getmatchfacetrack2facetrackresult(self):
        facetrack_id = "18ac706c-8e6f-401c-9be6-daaf53bb8845"
        id_trans = self.matchfacetrack2facetrack(facetrack_id, [])["result"]["results"]["transId"]
        print(id_trans)
        for retry_times in range(10):
            result = self.getmatchfacetrack2facetrackresult(id_trans, facetrack_id)
            if result["result"]["msg"]=="SUCC":
                break
            import time
            time.sleep(1)
            continue
        print("*" * 20, "test_getmatchfacetrack2facetrackresult", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #创建FaceTrack
    def createfacetrack(self):
        method = "createfacetrack"
        params = {
            "appkey": self.app_key
        }
        return self.send(method, params)

    def test_createfacetrack(self):
        result = self.createfacetrack()
        print("*" * 20, "test_createfacetrack", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #创建FaceTrack（指定id)
    def createfacetrack_id(self, id_facetrack):
        method = "createfacetrack_id"
        params = {
            "appkey": self.app_key,
            "id_facetrack": id_facetrack
        }
        return self.send(method, params)

    def test_createfacetrack_id(self):
        pass

    #添加图像到FaceTrack
    def addimgtofacetrack(self, img, id_facetrack):
        method = "addimgtofacetrack"
        params = {
            "appkey": self.app_key,
            "img": img,
            "id_facetrack": id_facetrack
        }
        return self.send(method, params)

    def test_addimgtofacetrack(self):
        pass

    # -------------------Person相关API----------------------#
    #获取所有Person
    #暂无

    #创建Person, sex:男1， 女0, 不指定-1,groups可为空
    def createperson(self, sex, groups):
        method = "createperson"
        params = {
            "appkey": self.app_key,
            "info": {
                "sex": sex,
                "groups":groups
            }
        }
        return self.send(method, params)

    def test_createperson(self):
        sex = 1
        result = self.createperson(sex)
        print("*" * 20, "test_createperson", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #创建Person（输入ID标识）
    def createperson_id(self, id, sex, groups):
        method = "createperson_id"
        params = {
            "appkey": self.app_key,
            "id": id,
            "info": {
                "sex": sex,
                "groups": groups
            }
        }
        return self.send(method, params)

    def test_createperson_id(self):
        pass

    #将FaceTrack图像导入Person
    def addfacetracktoperson(self, id_facetrack, id_person):
        method = "addfacetracktoperson"
        params = {
            "appkey": self.app_key,
            "id_facetrack": id_facetrack,
            "id_person": id_person
        }
        return self.send(method, params)

    def test_addfacetracktoperson(self):
        pass

    #撤销导入Person的FaceTrack
    def cancelfacetrackfromperson(self, id_facetrack):
        method = "cancelfacetrackfromperson"
        params = {
            "appkey": self.app_key,
            "id_facetrack": id_facetrack,
        }
        return self.send(method, params)

    def test_cancelfacetrackfromperson(self):
        pass

    #获取被添加到Person的FaceTrack列表
    def getpersonrelatedfacetracks(self, id):
        method = "getpersonrelatedfacetracks"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)

    def test_getpersonrelatedfacetracks(self):
        id = "4355bc6c-f70c-4d39-8f67-e2de61882f90"
        result = self.getpersonrelatedfacetracks(id)
        print("*" * 20, "test_getpersonrelatedfacetracks", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #添加单个人脸图像到Person
    def addimgtoperson(self, img, id_person):
        method = "addimgtoperson"
        params = {
            "appkey": self.app_key,
            "img": img,
            "id_person": id_person
        }
        return self.send(method, params)

    def test_addimgtoperson(self):
        pass

    #获取Person信息
    def getpersoninfo(self, id):
        method = "getpersoninfo"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)

    def test_getpersoninfo(self):
        id = "4355bc6c-f70c-4d39-8f67-e2de61882f90"
        result = self.getpersoninfo(id)
        print("*" * 20, "test_getpersoninfo", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #删除Person中特定图像文件
    def deletepersonimg(self, id, img):
        method = "deletepersonimg"
        params = {
            "appkey": self.app_key,
            "id": id,
            "img": img
        }
        return self.send(method, params)

    def test_deletepersonimg(self):
        pass

    #删除Person
    def deleteperson(self, id):
        method = "deleteperson"
        params = {
            "appkey": self.app_key,
            "id": id
        }
        return self.send(method, params)

    def test_deleteperson(self):
        pass

    #在FaceTrack中匹配Person
    def matchperson2facetrack(self, id, src_ids):
        method = "matchperson2facetrack"
        params = {
            "appkey": self.app_key,
            "id": id,
            "src_ids": src_ids
        }
        return self.send(method, params)

    def test_matchperson2facetrack(self):
        id = "4355bc6c-f70c-4d39-8f67-e2de61882f90"
        src_ids = []
        result = self.matchperson2facetrack(id, src_ids)
        print("*" * 20, "test_matchperson2facetrack", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #获取上一匹配结果
    def getmatchpersonresult(self, id_person, id_trans):
        method = "getmatchpersonresult"
        params = {
            "appkey": self.app_key,
            "id_person": id_person,
            "id_trans": id_trans
        }
        return self.send(method, params)

    def test_getmatchpersonresult(self):
        id_trans = "1e97586d-67dc-414e-92da-7a0ff0cd0d82"
        id_person = "4355bc6c-f70c-4d39-8f67-e2de61882f90"
        result = self.getmatchpersonresult(id_person, id_trans)
        print("*" * 20, "test_getmatchpersonresult", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #合并Person, id2的相关数据会转移到id1
    def mergepersons(self, id1, id2):
        method = "mergepersons"
        params = {
            "appkey": self.app_key,
            "id1": id1,
            "id2": id2
        }
        return self.send(method, params)

    def test_mergepersons(self):
        pass

    #在Person库中检索与某一Person相似的其他Person
    def matchperson2person(self, id, groups):
        method = "matchperson2person"
        params = {
            "appkey": self.app_key,
            "id": id,
            "info":{
                "groups": groups
            }
        }
        return self.send(method, params)

    def test_matchperson2person(self):
        id = "4355bc6c-f70c-4d39-8f67-e2de61882f90"
        src_ids = []
        result = self.matchperson2person(id, src_ids)
        print("*" * 20, "test_matchperson2person", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    #获取上一匹配的结果
    def getmatchperson2personresult(self, id_person, id_trans):
        method = "getmatchperson2personresult"
        params = {
            "appkey": self.app_key,
            "id_person": id_person,
            "id_trans": id_trans
        }
        return self.send(method, params)

    def test_getmatchperson2personresult(self):
        id_person = "a286f8af-ea45-41d4-9ab3-3dbd155d8882"
        id_trans =  self.matchperson2person(id_person, [])['result']['results']['transId']
        sleep_seconds = 0
        while True:
            import time
            time.sleep(1)
            sleep_seconds += 1
            result = self.getmatchperson2personresult(id_person, id_trans)
            print("*" * 20, "test_getmatchperson2personresult", "*" * 20)
            print(json.dumps(result, ensure_ascii=False, indent=4))
            if result["result"]["msg"] == "SUCC":
                break

    # -------------------FaceTrack相关API----------------------#
    #截取单个人脸区域
    def cropface(self, img):
        method = "cropface"
        params = {
            "appkey": self.app_key,
            "style": {
                "glasses": False,
                "glasses_id": 0,
                "hair": False,
                "hair_id": 0
            },
            "img": img
        }
        return self.send(method, params)

    def test_cropface(self):
        pass

    #截取多个人脸区域
    def cropfaces(self, img):
        method = "cropfaces"
        params = {
            "appkey": self.app_key,
            "style": {
                "glasses": False,
                "glasses_id": 0,
                "hair": False,
                "hair_id": 0
            },
            "img": img
        }
        return self.send(method, params)

    def test_cropfaces(self):
        pass

    #获取图像（FaceTrack、Person、视频源等）
    #type：0（FaceTrack图像列表中的图像），1（Person图像列表中的图像），2（Facerack对应的视频截图），3（最新视频源截图）
    def getsingleimg(self, type, id, path):
        method = "getsingleimg"
        params = {
            "appkey": self.app_key,
            "type": type,
            "id": id,
            "path": path
        }
        return self.send(method, params)

    def test_getsingleimg(self):
        type = 2
        id =  "0038a379-1af7-4d41-8b5d-ec6c711f3685"
        path = "img_4497cb0e-0904-4aba-b493-5cf443d5ada4.jpg"
        result = self.getsingleimg(type, id, path)
        print("*" * 20, "test_getsingleimg", "*" * 20)
        print(json.dumps(result, ensure_ascii=False, indent=4))

    # 停用APP
    def deactiveapp(self):
        method = "deactiveapp"
        params = {
            "appkey": self.app_key,
            "name": DEEPFACE_NAME,
            "pwd": DEEPFACE_PWD
        }
        return self.send(method, params)

    def test_deactiveapp(self):
        pass

    # 启用APP
    def activeapp(self):
        method = "activeapp"
        params = {
            "appkey": self.app_key,
            "name": DEEPFACE_NAME,
            "pwd": DEEPFACE_PWD
        }
        return self.send(method, params)

    def test_activeapp(self):
        pass

    # 获取APP下的区域列表
    def getareas(self):
        method = "getareas"
        params = {
            "appkey": self.app_key,
        }
        return self.send(method, params)

    def test_getareas(self):
        pass

    # 获取区域包含的设备列表
    def getdevices(self, id_area):
        method = "getdevices"
        params = {
            "appkey": self.app_key,
            "id_area": id_area
        }
        return self.send(method, params)

    def test_getdevices(self):
        pass

    # 获取区域包含的设备下的摄像头
    def getsources(self, id_device):
        method = "getsources"
        params = {
            "appkey": self.app_key,
            "id_device": id_device
        }
        return self.send(method, params)

    def test_getsources(self):
        pass

    # 更新视频源状态(启动、停止切换)
    def changesourcestate(self, id_src):
        method = "changesourcestate"
        params = {
            "appkey": self.app_key,
            "id_src": id_src
        }
        return self.send(method, params)

    def test_changesourcestate(self):
        pass
    #测试
    def test(self):
        #self.test_getunprocessedfacetrack()
        #self.test_getunprocessedmatchedfacetrack()
        self.test_getfacetrackinfo()
        #self.test_matchfacetrack2singleperson()
        #self.test_matchfacetrack2person()
        #self.test_getmatchfacetrackresult()
        #self.test_matchfacetrack2person_sync()
        #self.test_matchfacetrack2facetrack()
        #self.test_getmatchfacetrack2facetrackresult()
        #self.test_createfacetrack()
        #self.test_createperson()
        #self.test_getpersonrelatedfacetracks()
        #self.test_getpersoninfo()
        #self.test_matchperson2facetrack()
        #self.test_getmatchpersonresult()
        #self.test_matchperson2person()
        #self.test_getmatchperson2personresult()
        #self.test_getsingleimg()
        #self.test_searchfacetrack()
        #self.test_searchpersons()
        #self.test_getsingleimg()
        #self.test_getmatchperson2personresult()
        #self.test_getmatchfacetrackresult()

'''
deepface_api = DeepFaceAPI(settings.APP_HOST, settings.APP_KEY)

if __name__ == '__main__':
    deepface_api.test()
'''
