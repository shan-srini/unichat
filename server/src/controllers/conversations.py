from flask import Blueprint, request, jsonify, g
from services import chat as chat_service
from flask_cors import cross_origin

conversations = Blueprint('conversations', __name__)

@conversations.route('/conversation', methods=['POST'])
# @cross_origin()
def create_group():
    """
    Attempts to create a conversation
    body:
        - groupId: str representing groupId to create
    """
    body = request.get_json(force=True)
    group_id = body.get('groupId')
    # check in redis if group_id already exists
    success = chat_service.create_conversation(group_id)
    return_code = 201 if success else 409
    return jsonify({'success': success}), return_code

@conversations.route('/conversation/<conv_id>/<language>')
# @cross_origin()
def get_conversation(conv_id: str, language: str):
    """
    Get a conversation from a given ID
    potential query parameters are:
        - page
        (can keep a default page size of 10 or accept another parameter called "size")
    """
    messages = chat_service.get_conversation(conv_id, language)
    return jsonify({'messages': messages}), 200

@conversations.route('/conversation/<conv_id>/exists')
# @cross_origin()
def conversation_exists(conv_id: str):
    key = chat_service.CONVERSATION.format(conv_id)
    exists = chat_service.conversation_exists(key)
    return jsonify({'exists': exists}), 200 if exists else 404