"""
Chat service: Redis related logic
"""
import json
from datetime import datetime
import uuid
import redis
from ibm_cloud_sdk_core import ApiException
from ibm_watson import LanguageTranslatorV3

# Constants
CONVERSATION = "CONVERSATION_ID:{}" # -> time_created
CONVERSATION_MESSAGES = f"{CONVERSATION}#MESSAGES" # -> [message_ids ... ]
CONVERSATION_LANGUAGES = f"{CONVERSATION}#LANGUAGES" # -> set(languages...)
MESSAGE = "MESSAGE_ID:{}" # -> HASH(id, body, convo, sender, timestamp, language)
MESSAGE_LANG = f"{MESSAGE}" + "#{}" # -> HASH(id, body, convo, sender, timestamp, language)


redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
translator = LanguageTranslatorV3(version='2018-05-01')
translation = translator.translate(
    text='Hello, how are you today?',
    model_id='en-es').get_result()
json.dumps(translation, indent=2, ensure_ascii=False)

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

def persist_convo_language(conversation_id: str, language: str):
    key = CONVERSATION_LANGUAGES.format(conversation_id)
    redis.sadd(key, language)

def get_convo_languages(conversation_id: str) -> set:
    key = CONVERSATION_LANGUAGES.format(conversation_id)
    return redis.smembers(key)

def persist_message(conversation_id: str, message: str, sent_by: str, language: str, timestamp: float = datetime.utcnow().timestamp()) -> bool:
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
    message_lang_key = MESSAGE_LANG.format(message_id, language)
    message_val = {
        'id': message_id,
        'convo': conversation_id,
        'body': message,
        'sender': sent_by,
        'timestamp': timestamp,
        'language': language,
    }
    redis.hset(message_key, mapping=message_val)
    redis.hset(message_lang_key, mapping=message_val)
    return message_val

def get_conversation(conversation_id: str, language: str):
    """ get a conversation using start and end for the lrange """
    ids_key = CONVERSATION_MESSAGES.format(conversation_id)
    message_ids = redis.lrange(ids_key, 0, -1)
    messages = [get_msg_in_lang(m_id, language) for m_id in message_ids]
    return messages

def get_msg_in_lang(message_id: str, language: str) -> dict:
    message_lang_key = MESSAGE_LANG.format(message_id, language)
    res = redis.hgetall(message_lang_key)
    if (len(res)):
        return res
    original = redis.hgetall(MESSAGE.format(message_id))
    model = original['language'] + '-' + language
    try:
        translation = translator.translate(
            text=original['body'],
            model_id=model).get_result()
        message_val = {
            **original,
            'body': translation['translations'][0]['translation'],
            'language': language,
        }
        redis.hset(message_lang_key, mapping=message_val)
        return message_val
    except ApiException as e:
        print('could not translate', model, e)
        redis.hset(message_lang_key, mapping=original) #cache the untranslated anyways
        return original
