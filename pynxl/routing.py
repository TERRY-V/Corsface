from channels.routing import route
from listener import consumer
from django.conf import settings

channel_routing = [
    route("websocket.connect", consumer.ws_connect_consumer, path=r'^/facetrack/websocket$'),
    route("websocket.disconnect", consumer.ws_disconnect_consumer, path=r'^/facetrack/websocket$'),
    route("websocket.receive", consumer.ws_receive_consumer, path=r'^/facetrack/websocket$'),
    route(settings.CHANNEL_FACETRACK_CREATED, consumer.facetrack_created_consumer),
    route(settings.CHANNEL_FACETRACK_APPENDED, consumer.facetrack_appended_consumer),
    route(settings.CHANNEL_PERSON_SYNCHRONIZE, consumer.person_synchronize_consumer)
]
