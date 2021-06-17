from flask import Blueprint, request, jsonify, g
from services import chat as chat_service

conversations = Blueprint('conversations', __name__)

@conversations.route('/createGroup', methods=['POST'])
def create_group():
    """
    Attempts to create a conversation
    body:
        - groupId: str representing groupId to create
    """
    body = request.get_json()
    group_id = body.get('groupId')
    # check in redis if group_id already exists
    success = chat_service.create_conversation(group_id)
    return_code = 201 if success else 409
    return jsonify({'success': success}), return_code

@conversations.route('/conversation/<string:id>')
def get_conversation(conv_id: str):
    """
    Get a conversation from a given ID
    potential query parameters are:
        - page
        (can keep a default page size of 10 or accept another parameter called "size")
    """
    page = request.args.get('page', 0)
    
    # Set up the start and end spots of the page
    start = page * 10
    end = (page + 1) * 10

    message_ids = g.redis.lrange(conv_id, start, end)
    messages = g.redis.hgetall(message_ids)
    
    return messages
