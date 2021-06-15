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
    print('GOT MESSAGE', msg)
    # TODO: save the msg to redis here. will need to send stuff like user info as well
    send(msg, broadcast=True)
    return None

@app.before_request
def connect_redis():
    """ Connect Redis client before request """
    g.redis = redis.Redis(host='localhost', port=6379, db=0)

if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()
    socketIo.run(app)