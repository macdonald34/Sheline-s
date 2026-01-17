import os
import datetime
import jwt
from flask import current_app

def create_jwt(identity, expires_minutes=60):
    key = os.getenv('SECRET_KEY') or current_app.config.get('SECRET_KEY')
    payload = {
        'sub': identity,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    }
    token = jwt.encode(payload, key, algorithm='HS256')
    # PyJWT returns str in newer versions
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def decode_jwt(token):
    key = os.getenv('SECRET_KEY') or current_app.config.get('SECRET_KEY')
    try:
        payload = jwt.decode(token, key, algorithms=['HS256'])
        return payload
    except Exception:
        return None
