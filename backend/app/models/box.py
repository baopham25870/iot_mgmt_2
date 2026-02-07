# app/models/box.py
from app import db

class Box(db.Model):
    __tablename__ = 'boxes'

    box_id = db.Column(db.BigInteger, primary_key=True)
    box_name = db.Column(db.String(100), nullable=False)
    box_code = db.Column(db.String(45), nullable=True)
    box_ip = db.Column(db.String(45))
    box_netmask = db.Column(db.String(45))
    box_gateway = db.Column(db.String(45))
    box_dns = db.Column(db.String(45))
    box_ntp = db.Column(db.String(45))
    location_id = db.Column(db.BigInteger, db.ForeignKey('locations.location_id'), nullable=False)
    box_status = db.Column(db.String(20), default='active')
    installed_at = db.Column(db.Date)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Constraint CHECK (Flask-SQLAlchemy không tự tạo CHECK, nhưng có thể validate ở code)
    # Bạn có thể thêm validator nếu cần

    # Relationship
    cameras = db.relationship('Camera', backref='box', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Box {self.box_name} ({self.box_ip})>"