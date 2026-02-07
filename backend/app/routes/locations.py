from flask import Blueprint, jsonify
from app.models.location import Location
from app import db

locations_bp = Blueprint('locations', __name__)

@locations_bp.route('/locations', methods=['GET'])
def get_locations():
    locations = Location.query.all()
    return jsonify([{
        "location_id": loc.location_id,
        "location_code": loc.location_code,
        "location_name": loc.location_name
    } for loc in locations])