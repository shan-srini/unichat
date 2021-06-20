import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO, send, join_room
from services.chat import persist_message, persist_convo_language, get_convo_languages, get_msg_in_lang
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
CORS(app)

socketIo = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])

app.debug = True
app.host = '0.0.0.0'

# routes
from controllers.conversations import conversations
app.register_blueprint(conversations)

# maybe move this & other websocket logic to another file eventually to keep this entry point file clean?
@socketIo.on("message")
def handleMessage(msg):
    ''' Saves Message to Redis and then sends it to the Socket'''
    # Saves message to Redis
    msg_values = persist_message(msg['conversation_id'], msg['message'],
                                 msg['sent_by'], msg['language'])
    
    # Sends messages through socket
    room_langs = get_convo_languages(msg['conversation_id'])
    for lang in room_langs:
        translated = get_msg_in_lang(msg_values['id'], lang)
        send(translated, room=f"{msg['conversation_id']}#{lang}")
    #TODO: optimize extra translations for disconnected sockets
    return None

@socketIo.on("joinRoom")
def handleJoinRoom(payload):
    room_id = f"{payload['conversation_id']}#{payload['language']}"
    join_room(room_id)
    persist_convo_language(payload['conversation_id'], payload['language'])
    # request.sid to identify sockets


if __name__ == '__main__':
    socketIo.run(app)
