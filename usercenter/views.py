# -*- coding: utf-8 -*-


import json

from django.contrib import auth

from django.contrib.auth.decorators import login_required

from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger, InvalidPage

from django.http import HttpResponse
from django.db.models import Q
from django.views.generic import View

from usercenter.models import *
from system.models import SystemMenu
from operator import itemgetter
from itertools import groupby

class UserCenter(View):
    def post(self, request, *args, **kwargs):
        slug = self.kwargs.get('slug')
        if slug == 'login':
            return self.login(request)
        elif slug == 'logout':
            return self.logout(request)
        raise PermissionDenied

    def login(self, request):
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            if 'HTTP_X_FORWARDED_FOR' in request.META:
                user.last_login_ip = request.META['HTTP_X_FORWARDED_FOR']
            else:
                user.last_login_ip = request.META['REMOTE_ADDR']
            user.save()
            context = {"status": 0}
        else:
            context = {"status": -1}
            context["errors"] = [u'用户名或密码错误']
        return HttpResponse(json.dumps(context), content_type="application/json")

    def logout(self, request):
        auth.logout(request)
        return HttpResponse(json.dumps({"status": 0}), content_type="application/json")


@login_required(login_url='/corsface/login')
def userList(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        cur_page = request.POST.get("pageno", 1)
        page_size = request.POST.get("pagesize", 13)
        username = request.POST.get("username", '')
        roleid = request.POST.get("roleid", 0)
        if len(username) ==0 and int(roleid)==0:
            record_list = User.objects.filter(is_active=1)
        elif len(username) >0 and int(roleid)==0:
            record_list = User.objects.filter(Q(is_active=1) & Q(username__icontains=username))
        elif len(username) ==0 and int(roleid)>0:
            record_list = User.objects.filter(is_active=1,role_id=roleid)
        paginator = Paginator(record_list, page_size)
        try:
            contacts = paginator.page(cur_page)
        except (EmptyPage, InvalidPage):
            contacts = paginator.page(paginator.num_pages)

        response = [ob.as_json() for ob in contacts]
        responselist = []
        for x in response:
            if x['role_id']:
                result_role = UsercenterRole.objects.filter(id=x['role_id']).first()
                x['role_name'] = result_role.role_name
                responselist.append(x)
            else:
                x['role_name'] = '普通组'
                responselist.append(x)
        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = responselist
        response_data['allnum'] = len(record_list)
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def userDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', '')
        id_list = id.strip(',').split(',')
        if len(id_list) > 0:
            res = User.objects.filter(id__in=id_list).delete()
            if res:
                response_data['code'] = 0
                response_data['message'] = 'success'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def userSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        post_id = request.POST.get('id', 0)
        user_name = request.POST.get('username')
        password = request.POST.get('password', '')

        if int(post_id) > 0:
            try:
                user = User.objects.get(id=post_id)
                if password and len(password) < 15:
                    user.set_password(password)
                user.username = user_name
                user.sex = request.POST.get('sex', 0)
                user.phone = request.POST.get('phone')
                user.intro = request.POST.get('intro')
                user.u_name = request.POST.get('uname')
                user.email = request.POST.get('email', '')
                user.role_id = request.POST.get('roleid', 0)
                user.save()
                response_data['code'] = 0
                response_data['message'] = 'success'
            except:
                response_data['code'] = -1
                response_data['message'] = '修改失败'
        else:
            try:
                user = User.objects.create_user(user_name, user_name + '@admin.com', password)
                user.u_name = request.POST.get('uname')
                user.sex = request.POST.get('sex', 0)
                user.phone = request.POST.get('phone')
                user.intro = request.POST.get('intro')
                user.email = request.POST.get('email', '')
                user.role_id = request.POST.get('roleid', 0)
                user.save()
                response_data['code'] = 0
                response_data['message'] = 'success'
            except:
                response_data['code'] = -1
                response_data['message'] = '用户名已经存在'
    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = User.objects.filter(id=post_id,is_active=1)
            response = [ob.as_json() for ob in resultset]
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = response

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleList(request):
    response_data = {'code': -1, 'message': 'parar is error'}
    if request.method == 'POST':
        cur_page = request.POST.get("pageno", 1)
        page_size = request.POST.get("pagesize", 13)
        record_list = UsercenterRole.objects.filter()
        paginator = Paginator(record_list, page_size)
        try:
            contacts = paginator.page(cur_page)
        except (EmptyPage, InvalidPage):
            contacts = paginator.page(paginator.num_pages)

        response = [ob.as_json() for ob in contacts]
        responselist = []
        for x in response:
            result_role = User.objects.filter(role_id=x['id'],is_active=1)
            user_name = ''
            if len(result_role) > 0:
                for i in result_role:
                    user_name = user_name + i.username + '、'
            x['username'] = user_name.strip('、')
            responselist.append(x)

        response_data = {}
        response_data['code'] = 0
        response_data['message'] = 'success'
        response_data['data'] = responselist
        response_data['allnum'] = len(record_list)
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['role_name'] = request.POST.get('role_name')
        request_data['e_name'] = request.POST.get('e_name')
        request_data['remark'] = request.POST.get('remark')
        if id and int(id)>0:
            res = UsercenterRole.objects.filter(id=id).update(**request_data)
        else:
            res = UsercenterRole.objects.create(**request_data)

        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'
    else:
        post_id = request.GET.get('id')
        if post_id and int(post_id) > 0:
            resultset = UsercenterRole.objects.filter(id=post_id)
            response = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleDelete(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        id = request.POST.get('id', '')
        id_list = id.strip(',').split(',')
        if len(id_list) > 0:
            res_num = User.objects.filter(role_id__in=id_list,is_active=1).count()
            if not res_num:
                res = UsercenterRole.objects.filter(id__in=id_list).delete()
                if res:
                    response_data['code'] = 0
                    response_data['message'] = 'success'
            else:
                response_data['code'] = -1
                response_data['message'] = '该角色下存在用户，请取消后提交'
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleMenu(request):
    record_list = SystemMenu.objects.filter()
    response = [ob.as_json() for ob in record_list]
    response.sort(key=itemgetter('pid'))  # 需要先排序，然后才能groupby。lst排序后自身被改变
    lstg = groupby(response, itemgetter('pid'))
    response = {key: list(group) for key, group in lstg}
    response_list = []
    for x in response[0]:
        try:
            x['sid_list'] = response[x['id']]
        except:
            x['sid_list'] = []
        response_list.append(x)

    response_data = {}
    response_data['code'] = 0
    response_data['message'] = 'success'
    response_data['data'] = response_list
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleMenuSave(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        request_data = {}
        id = request.POST.get('id', 0)
        request_data['role_id'] = request.POST.get('role_id')
        request_data['menu_id_str'] = request.POST.get('menu_id_str').strip(',')
        if id and int(id)>0:
            res = UsercenterRoleMenu.objects.filter(id=id).update(**request_data)
        else:
            res = UsercenterRoleMenu.objects.create(**request_data)
        if res:
            response_data['code'] = 0
            response_data['message'] = 'success'
    else:
        post_id = request.GET.get('roleid')
        if post_id and int(post_id) > 0:
            resultset = UsercenterRoleMenu.objects.filter(role_id=post_id)
            response = [ob.as_json() for ob in resultset]
            response_data = {}
            response_data['code'] = 0
            response_data['message'] = 'success'
            response_data['data'] = response
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required(login_url='/corsface/login')
def roleUser(request):
    response_data = {'code': -1, 'message': 'param is error'}
    if request.method == 'POST':
        userid_str = request.POST.get('userid_str','')
        roleid= request.POST.get('roleid')
        userid_list=userid_str.strip(',').split(',')
        User.objects.filter(role_id=roleid).update(role_id=0)
        if userid_list[0]:
            User.objects.filter(id__in=userid_list).update(role_id=roleid)
        response_data['code'] = 0
        response_data['message'] = 'success'

    return HttpResponse(json.dumps(response_data), content_type="application/json")
