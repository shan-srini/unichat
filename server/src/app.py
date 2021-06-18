from flask import Flask, jsonify, g
from flask_socketio import SocketIO, send, join_room
import redis
from services.chat import persist_message
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
CORS(app, origins=['*'])

socketIo = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])

app.debug = True
app.host = 'localhost'

# routes
from controllers.conversations import conversations
app.register_blueprint(conversations)

# maybe move this & other websocket logic to another file eventually to keep this entry point file clean?
@socketIo.on("message")
def handleMessage(msg):
    ''' Saves Message to Redis and then sends it to the Socket'''
    # Saves message to Redis
    msg_values = persist_message(msg['conversation_id'], msg['message'],
                                 msg['sent_by'])
    
    # Sends messages through socket            
    send(msg_values, room=msg['conversation_id'])
    return None

@socketIo.on("joinRoom")
def handleJoinRoom(room_id):
    join_room(room_id)

# @conversations.before_request
# def connect_redis():
#     """ Connect Redis client before request """
#     g.redis = redis.Redis(host='localhost', port=6379, db=0)

# @app.after_request
# def after_request(response):
#     header = response.headers
#     header['Access-Control-Allow-Origin'] = '*'
#     header['Access-Control-Allow-Headers'] = '*'
#     return response

if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()
    socketIo.run(app)
