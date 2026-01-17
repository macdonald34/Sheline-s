from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
	__tablename__ = 'users'
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(80), unique=True, nullable=False)
	email = db.Column(db.String(120), unique=True, nullable=False)
	password_hash = db.Column(db.String(200), nullable=True)

	def to_dict(self):
		return {'id': self.id, 'username': self.username, 'email': self.email}

	def set_password(self, raw_password):
		from passlib.context import CryptContext
		pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
		self.password_hash = pwd.hash(raw_password)

	def check_password(self, raw_password):
		from passlib.context import CryptContext
		pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
		if not self.password_hash:
			return False
		return pwd.verify(raw_password, self.password_hash)


def init_db(app=None):
	"""Create database tables if they do not exist."""
	if app is None:
		raise RuntimeError('An app must be provided to init_db')
	with app.app_context():
		db.create_all()


class Event(db.Model):
	__tablename__ = 'events'
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(200), nullable=False)
	description = db.Column(db.Text, nullable=True)
	start_time = db.Column(db.DateTime, nullable=True)
	end_time = db.Column(db.DateTime, nullable=True)
	location = db.Column(db.String(200), nullable=True)
	created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

	def to_dict(self):
		return {
			'id': self.id,
			'title': self.title,
			'description': self.description,
			'start_time': self.start_time.isoformat() if self.start_time else None,
			'end_time': self.end_time.isoformat() if self.end_time else None,
			'location': self.location,
			'created_by': self.created_by,
		}


class Vendor(db.Model):
	__tablename__ = 'vendors'
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(200), nullable=False)
	service = db.Column(db.String(200), nullable=True)
	contact_email = db.Column(db.String(200), nullable=True)

	def to_dict(self):
		return {
			'id': self.id,
			'name': self.name,
			'service': self.service,
			'contact_email': self.contact_email,
		}


class Booking(db.Model):
	__tablename__ = 'bookings'
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
	event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
	vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=True)
	status = db.Column(db.String(50), default='pending')
	created_at = db.Column(db.DateTime, server_default=db.func.now())

	def to_dict(self):
		return {
			'id': self.id,
			'user_id': self.user_id,
			'event_id': self.event_id,
			'vendor_id': self.vendor_id,
			'status': self.status,
			'created_at': self.created_at.isoformat() if self.created_at else None,
		}

