# -*- coding:utf-8 -*-

import json
from django.conf import settings

def smoothingAlgorithm(score):
    if score > 0 and score < 0.85:
        score = score + 0.15
    return score

