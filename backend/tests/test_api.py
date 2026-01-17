import os
import json
import tempfile
import pytest

from app import create_app
from models import db


@pytest.fixture
def client(tmp_path):
    db_file = tmp_path / "test.db"
    os.environ['DATABASE_URL'] = f"sqlite:///{db_file}"
    os.environ['ADMIN_API_KEY'] = 'test-key'
    os.environ['SECRET_KEY'] = 'test-secret'
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client


def test_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    assert rv.get_json()['status'] == 'ok'


def test_user_crud_and_auth(client):
    # create user (protected)
    rv = client.post('/api/users', json={'username': 'u1', 'email': 'u1@x.com'}, headers={'X-API-KEY': 'test-key'})
    assert rv.status_code == 201
    data = rv.get_json()
    assert data['username'] == 'u1' or data.get('user')

    # signup
    rv = client.post('/api/auth/signup', json={'username': 'u2', 'email': 'u2@x.com', 'password': 'pass'})
    assert rv.status_code == 201
    body = rv.get_json()
    assert 'token' in body

    # login
    rv = client.post('/api/auth/login', json={'username': 'u2', 'password': 'pass'})
    assert rv.status_code == 200
    body = rv.get_json()
    assert 'token' in body
