from flask import Flask, jsonify;
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

socketIo = SocketIO(app, cors_allowed_origins="*")

app.debug = True
app.host = 'localhost'


@socketIo.on("message")
def handleMessage(msg):
    print('GOT MESSAGE', msg)
    # TODO: save the msg to redis here. will need to send stuff like user info as well
    send(msg, broadcast=True)
    return None

if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()
    socketIo.run(app)