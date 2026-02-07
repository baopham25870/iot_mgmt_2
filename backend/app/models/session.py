# app/models/session.py
from app import db
from sqlalchemy.dialects.postgresql import INET

class UserSession(db.Model):
    __tablename__ = 'user_sessions'

    session_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    token_jti = db.Column(db.String(36), unique=True, nullable=False)
    ip_address = db.Column(INET)
    user_agent = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp())
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    is_revoked = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Session {self.token_jti} for user {self.user_id}>"