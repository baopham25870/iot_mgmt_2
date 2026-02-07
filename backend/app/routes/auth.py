# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import bcrypt, db
from datetime import timedelta, datetime, timezone
import re

auth_bp = Blueprint('auth', __name__)

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    return True, ""

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Thiếu username hoặc password"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "Tài khoản không tồn tại"}), 401

    if not user.is_active:
        return jsonify({"error": "Tài khoản bị khóa"}), 403

    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Mật khẩu sai"}), 401

    # Cập nhật last_login
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    # Tạo JWT token (hết hạn sau 1 ngày)
    access_token = create_access_token(
        identity=user.user_id,
        additional_claims={"role": user.role},
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "message": "Đăng nhập thành công",
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint - client should remove token from storage.
    For stronger security, implement token blacklist here.
    """
    current_user_id = get_jwt_identity()
    return jsonify({"message": "Đăng xuất thành công"}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint.
    Requires username, password, and optional email/full_name.
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    full_name = data.get('full_name')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Validate password strength
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    # Check if email already exists (if provided)
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    # Hash password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create new user (default role is 'viewer')
    new_user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        role='viewer'
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.user_id,
            "username": new_user.username,
            "role": new_user.role
        }
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user info.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "last_login": user.last_login
    }), 200
