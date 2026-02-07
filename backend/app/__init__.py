# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 1 day in seconds

    # Khởi tạo extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # CORS configuration - restrict to frontend origin
    frontend_origin = os.getenv('FRONTEND_ORIGIN', '*')
    CORS(app, 
        resources={r"/api/*": {"origins": frontend_origin}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    from app.routes.search import search_bp
    app.register_blueprint(search_bp)
    from app.routes.locations import locations_bp
    app.register_blueprint(locations_bp)
    return app
