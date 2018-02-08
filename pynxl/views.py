# -*- coding: utf-8 -*-

import os
import json
import sys
import time
import datetime

from django.http import HttpResponse, HttpResponseRedirect

def home(request):
    return HttpResponseRedirect('/corsface')

