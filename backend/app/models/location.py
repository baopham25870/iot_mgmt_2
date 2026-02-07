# app/models/location.py
from app import db
from sqlalchemy.dialects.postgresql import ENUM

class Location(db.Model):
    __tablename__ = 'locations'

    location_id = db.Column(db.BigInteger, primary_key=True)
    location_name = db.Column(db.String(150), nullable=False)
    location_code = db.Column(db.String(50), unique=True, nullable=True)
    location_address = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationship
    boxes = db.relationship('Box', backref='location', lazy='dynamic', cascade='all, delete-orphan')
    cameras = db.relationship('Camera', backref='location', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Location {self.location_name} ({self.location_code})>"