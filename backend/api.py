from flask import Blueprint, jsonify, request
import os
from functools import wraps
from datetime import datetime
from models import db, User, Event, Vendor, Booking
from auth import create_jwt, decode_jwt
from schemas import UserSchema, EventSchema, VendorSchema, BookingSchema
from models import db
import time

# basic metrics
START_TIME = time.time()
api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/metrics', methods=['GET'])
def metrics():
    users = db.session.query(User).count()
    events = db.session.query(Event).count()
    vendors = db.session.query(Vendor).count()
    bookings = db.session.query(Booking).count()
    uptime = int(time.time() - START_TIME)
    return jsonify({'users': users, 'events': events, 'vendors': vendors, 'bookings': bookings, 'uptime_seconds': uptime})



def require_api_key(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        expected = os.getenv('ADMIN_API_KEY')
        if not expected:
            return jsonify({'error': 'server misconfiguration: ADMIN_API_KEY not set'}), 500
        key = request.headers.get('X-API-KEY')
        if key != expected:
            return jsonify({'error': 'unauthorized'}), 401
        return fn(*args, **kwargs)
    return wrapper


def paginate_query(query, schema_fn):
    try:
        page = max(1, int(request.args.get('page', 1)))
    except Exception:
        page = 1
    try:
        page_size = min(100, max(1, int(request.args.get('page_size', 20))))
    except Exception:
        page_size = 20
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        'items': [schema_fn(i) for i in items],
        'page': page,
        'page_size': page_size,
        'total': total,
    }


@api_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


# Users
@api_bp.route('/users', methods=['GET'])
def list_users():
    query = User.query.order_by(User.id.desc())
    return jsonify(paginate_query(query, lambda u: u.to_dict()))


@api_bp.route('/users', methods=['POST'])
@require_api_key
def create_user():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    if not username or not email:
        return jsonify({'error': 'username and email required'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'user already exists'}), 409
    user = User(username=username, email=email)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'username, email and password required'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'user already exists'}), 409
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = create_jwt({'user_id': user.id})
    return jsonify({'user': user.to_dict(), 'token': token}), 201


@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    user = User.query.filter((User.username == username) | (User.email == username)).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'invalid credentials'}), 401
    token = create_jwt({'user_id': user.id})
    return jsonify({'user': user.to_dict(), 'token': token})


@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_api_key
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    if username:
        user.username = username.strip()
    if email:
        user.email = email.strip()
    db.session.commit()
    return jsonify(user.to_dict())


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_api_key
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'deleted': True})


# Events
@api_bp.route('/events', methods=['GET'])
def list_events():
    query = Event.query.order_by(Event.id.desc())
    return jsonify(paginate_query(query, lambda e: e.to_dict()))


@api_bp.route('/events', methods=['POST'])
@require_api_key
def create_event():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400
    event = Event(
        title=title,
        description=data.get('description'),
        location=data.get('location'),
        created_by=data.get('created_by'),
    )
    # parse optional datetimes
    for field in ('start_time', 'end_time'):
        val = data.get(field)
        if val:
            try:
                setattr(event, field, datetime.fromisoformat(val))
            except Exception:
                return jsonify({'error': f'invalid {field}; use ISO format'}), 400
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@api_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict())


@api_bp.route('/events/<int:event_id>', methods=['PUT'])
@require_api_key
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json() or {}
    if 'title' in data:
        event.title = (data.get('title') or event.title)
    if 'description' in data:
        event.description = data.get('description')
    if 'location' in data:
        event.location = data.get('location')
    for field in ('start_time', 'end_time'):
        if field in data and data.get(field):
            try:
                setattr(event, field, datetime.fromisoformat(data.get(field)))
            except Exception:
                return jsonify({'error': f'invalid {field}; use ISO format'}), 400
    db.session.commit()
    return jsonify(event.to_dict())


@api_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({'deleted': True})


# Vendors
@api_bp.route('/vendors', methods=['GET'])
def list_vendors():
    query = Vendor.query.order_by(Vendor.id.desc())
    return jsonify(paginate_query(query, lambda v: v.to_dict()))


@api_bp.route('/vendors', methods=['POST'])
@require_api_key
def create_vendor():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'name is required'}), 400
    vendor = Vendor(name=name, service=data.get('service'), contact_email=data.get('contact_email'))
    db.session.add(vendor)
    db.session.commit()
    return jsonify(vendor.to_dict()), 201


@api_bp.route('/vendors/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    return jsonify(vendor.to_dict())


@api_bp.route('/vendors/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    data = request.get_json() or {}
    vendor.name = data.get('name', vendor.name)
    vendor.service = data.get('service', vendor.service)
    vendor.contact_email = data.get('contact_email', vendor.contact_email)
    db.session.commit()
    return jsonify(vendor.to_dict())


@api_bp.route('/vendors/<int:vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    db.session.delete(vendor)
    db.session.commit()
    return jsonify({'deleted': True})


# Bookings
@api_bp.route('/bookings', methods=['GET'])
def list_bookings():
    query = Booking.query.order_by(Booking.id.desc())
    return jsonify(paginate_query(query, lambda b: b.to_dict()))


@api_bp.route('/bookings', methods=['POST'])
@require_api_key
def create_booking():
    data = request.get_json() or {}
    try:
        user_id = int(data.get('user_id'))
        event_id = int(data.get('event_id'))
    except Exception:
        return jsonify({'error': 'user_id and event_id are required and must be integers'}), 400
    # verify existence
    if not User.query.get(user_id) or not Event.query.get(event_id):
        return jsonify({'error': 'user or event not found'}), 404
    booking = Booking(user_id=user_id, event_id=event_id, vendor_id=data.get('vendor_id'), status=data.get('status', 'pending'))
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201


@api_bp.route('/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    return jsonify(booking.to_dict())


@api_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    data = request.get_json() or {}
    booking.status = data.get('status', booking.status)
    booking.vendor_id = data.get('vendor_id', booking.vendor_id)
    db.session.commit()
    return jsonify(booking.to_dict())


@api_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'deleted': True})

