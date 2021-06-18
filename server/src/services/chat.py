"""
Chat service: Redis related logic
"""
from flask import g
from datetime import datetime
import uuid
import redis

# Constants
CONVERSATION = "CONVERSATION_ID:{}" # -> time_created
CONVERSATION_MESSAGES = f"{CONVERSATION}#MESSAGES" # -> [message_ids ... ]
MESSAGE = "MESSAGE_ID:{}" # -> HASH(message_body, timestamp, sender)

redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def conversation_exists(key: str) -> bool:
    """ check if a conversation exists 
    @return conversation key if it does exist else None
    """
    return redis.exists(key)

def create_conversation(_id: str) -> bool:
    """ Creates a conversation (group) with the given id.
    If it already exists returns False.
    """
    key = CONVERSATION.format(_id)
    if not _id or conversation_exists(key):
        # key does exist already, notify user of failure
        return False
    else:
        # epoch timestamp as float
        time_created = datetime.utcnow().timestamp()
        redis.set(key, time_created)
        return True

def persist_message(conversation_id: str, message: str, sent_by: str, timestamp: float = datetime.utcnow().timestamp()) -> bool:
    """ Persists a message in Redis
    @param conversation_id str: the id of the conversation
    @param message str: body of message
    @param sent_by str: the name of the user who sent the message
    @return bool: whether or not message was successfully saved
    """
    if not conversation_exists(CONVERSATION.format(conversation_id)):
        return False
    # generate key for list that stores all messages for a given conversation
    message_list_key = CONVERSATION_MESSAGES.format(conversation_id)
    # generate unique message id
    message_id = str(uuid.uuid4())
    # push message_id to message list for the given conversation
    redis.rpush(message_list_key, message_id)
    # persist message
    message_key = MESSAGE.format(message_id)
    message_val = {
        'id': message_id,
        'convo': conversation_id,
        'body': message,
        'sender': sent_by,
        'timestamp': timestamp
    }
    redis.hset(message_key, mapping=message_val)
    return message_val

def get_conversation(conversation_id: str):
    """ get a conversation using start and end for the lrange """
    ids_key = CONVERSATION_MESSAGES.format(conversation_id)
    message_ids = redis.lrange(ids_key, 0, -1)
    messages = [redis.hgetall(MESSAGE.format(m_id)) for m_id in message_ids]
    return messages