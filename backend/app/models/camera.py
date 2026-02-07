# app/models/camera.py
from app import db

class Camera(db.Model):
    __tablename__ = 'cameras'

    camera_id = db.Column(db.BigInteger, primary_key=True)
    camera_serial = db.Column(db.String(100), unique=True, nullable=False)
    camera_name = db.Column(db.String(100), nullable=False)
    camera_model = db.Column(db.String(100))
    camera_type = db.Column(db.String(10))
    camera_code = db.Column(db.String(45), nullable=True)
    camera_ip = db.Column(db.String(45))
    camera_netmask = db.Column(db.String(45))
    camera_gateway = db.Column(db.String(45))
    camera_dns = db.Column(db.String(45))
    camera_ntp = db.Column(db.String(45))
    location_id = db.Column(db.BigInteger, db.ForeignKey('locations.location_id'), nullable=False)
    box_id = db.Column(db.BigInteger, db.ForeignKey('boxes.box_id'), nullable=True)
    stream_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    resolution = db.Column(db.String(20))
    installed_at = db.Column(db.Date)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f"<Camera {self.camera_name} ({self.camera_serial})>"