from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from models import User, Event, Vendor, Booking

ma = Marshmallow()


class UserSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)


class EventSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime(allow_none=True)
    end_time = fields.DateTime(allow_none=True)
    location = fields.Str(allow_none=True)
    created_by = fields.Int(allow_none=True)


class VendorSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    service = fields.Str(allow_none=True)
    contact_email = fields.Email(allow_none=True)


class BookingSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    event_id = fields.Int(required=True)
    vendor_id = fields.Int(allow_none=True)
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
