# app/routes/search.py
from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_
from app import db
from app.models.location import Location
from app.models.box import Box
from app.models.camera import Camera

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
def general_search():
    """
    API General Search
    Query params:
    - type: box_code, box_ip, camera_code, camera_ip, camera_type, all (bắt buộc)
    - value: giá trị tìm kiếm (bắt buộc, hỗ trợ partial match)
    - location_code: optional - nếu có thì giới hạn tìm trong location đó
                      nếu là "all" hoặc không có thì tìm toàn bộ
    """
    search_type = request.args.get('type')
    search_value = request.args.get('value', '').strip()
    location_code = request.args.get('location_code')

    if not search_type or not search_value:
        return jsonify({"error": "Thiếu 'type' hoặc 'value'"}), 400

    valid_types = ['box_code', 'box_ip', 'camera_code', 'camera_ip', 'camera_type', 'all']
    if search_type not in valid_types:
        return jsonify({"error": f"Type không hợp lệ. Chỉ chấp nhận: {', '.join(valid_types)}"}), 400

    # Base query cho camera (vì hầu hết thông tin đều liên quan camera)
    query = db.session.query(Camera)\
        .outerjoin(Box, Camera.box_id == Box.box_id)\
        .outerjoin(Location, Camera.location_id == Location.location_id)

    # Giới hạn theo location_code nếu có
    if location_code and location_code.lower() != 'all':
        query = query.filter(Location.location_code == location_code)

    # Filter theo loại tìm kiếm (ilike để tìm partial, không phân biệt hoa thường)
    if search_type == 'all':
        # Search across all relevant fields
        query = query.filter(
            or_(
                Box.box_code.ilike(f"%{search_value}%"),
                Box.box_ip.ilike(f"%{search_value}%"),
                Camera.camera_code.ilike(f"%{search_value}%"),
                Camera.camera_ip.ilike(f"%{search_value}%"),
                Camera.camera_type.ilike(f"%{search_value}%"),
                Camera.camera_serial.ilike(f"%{search_value}%"),
                Camera.camera_name.ilike(f"%{search_value}%")
            )
        )
    elif search_type == 'box_code':
        query = query.filter(Box.box_code.ilike(f"%{search_value}%"))
    elif search_type == 'box_ip':
        query = query.filter(Box.box_ip.ilike(f"%{search_value}%"))
    elif search_type == 'camera_code':
        query = query.filter(Camera.camera_code.ilike(f"%{search_value}%"))
    elif search_type == 'camera_ip':
        query = query.filter(Camera.camera_ip.ilike(f"%{search_value}%"))
    elif search_type == 'camera_type':
        query = query.filter(Camera.camera_type.ilike(f"%{search_value}%"))

    # Lấy kết quả
    results = query.all()

    # Format dữ liệu trả về
    data = []
    for cam in results:
        box = cam.box
        loc = cam.location
        data.append({
            "camera_id": cam.camera_id,
            "camera_name": cam.camera_name,
            "camera_serial": cam.camera_serial,
            "camera_code": getattr(cam, 'camera_code', None),  # nếu có cột camera_code
            "camera_ip": cam.camera_ip,
            "camera_type": cam.camera_type,
            "status": cam.status,
            "stream_url": cam.stream_url,
            "box_id": box.box_id if box else None,
            "box_name": box.box_name if box else None,
            "box_code": getattr(box, 'box_code', None),
            "box_ip": box.box_ip if box else None,
            "location_id": loc.location_id,
            "location_code": loc.location_code,
            "location_name": loc.location_name
        })

    return jsonify({
        "status": "success",
        "total": len(data),
        "results": data,
        "search_params": {
            "type": search_type,
            "value": search_value,
            "location_code": location_code or "all"
        }
    })
