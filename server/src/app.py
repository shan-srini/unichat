from flask import Flask, jsonify, g
from flask_socketio import SocketIO, send
import redis

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

socketIo = SocketIO(app, cors_allowed_origins="*")

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
                                 msg['sent_by'], msg['timestamp'])
    
    # Sends messages through socket            
    send(msg_values, room=msg['conversation_id'])
    return None

@app.before_request
def connect_redis():
    """ Connect Redis client before request """
    g.redis = redis.Redis(host='localhost', port=6379, db=0)

if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()
    socketIo.run(app)
