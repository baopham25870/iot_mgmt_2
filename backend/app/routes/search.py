from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app import db
from app.models.box import Box
from app.models.camera import Camera
from app.models.location import Location

# Khai báo Blueprint đầu tiên (trước mọi route)
search_bp = Blueprint('search', __name__, url_prefix='/api')
@search_bp.route('/search', methods=['GET'])
def general_search():
    search_type = request.args.get('type', 'all')
    search_value = request.args.get('value', '').strip()
    location_code = request.args.get('location_code')

    # Bỏ kiểm tra bắt buộc value (cho phép value rỗng để hiển thị toàn bộ theo location)
    # if not search_value:
    #     return jsonify({"error": "Thiếu giá trị tìm kiếm (value)"}), 400

    # Query cơ bản
    query_boxes = db.session.query(Box).join(Location, Box.location_id == Location.location_id)
    query_cameras = db.session.query(Camera).join(Location, Camera.location_id == Location.location_id)

    # Giới hạn theo location_code (luôn áp dụng nếu có)
    if location_code and location_code.lower() != 'all':
        query_boxes = query_boxes.filter(Location.location_code == location_code)
        query_cameras = query_cameras.filter(Location.location_code == location_code)

    # Nếu có value → filter theo type
    if search_value:
        if search_type == 'box_code':
            query_boxes = query_boxes.filter(Box.box_code.ilike(f"%{search_value}%"))
        elif search_type == 'box_ip':
            query_boxes = query_boxes.filter(Box.box_ip.ilike(f"%{search_value}%"))
        elif search_type == 'camera_code':
            query_cameras = query_cameras.filter(Camera.camera_code.ilike(f"%{search_value}%"))
        elif search_type == 'camera_ip':
            query_cameras = query_cameras.filter(Camera.camera_ip.ilike(f"%{search_value}%"))
        elif search_type == 'camera_type':
            query_cameras = query_cameras.filter(Camera.camera_type.ilike(f"%{search_value}%"))
        else:
            # type=all hoặc không hợp lệ → tìm ở tất cả
            query_boxes = query_boxes.filter(
                or_(
                    Box.box_code.ilike(f"%{search_value}%"),
                    Box.box_ip.ilike(f"%{search_value}%")
                )
            )
            query_cameras = query_cameras.filter(
                or_(
                    Camera.camera_code.ilike(f"%{search_value}%"),
                    Camera.camera_ip.ilike(f"%{search_value}%"),
                    Camera.camera_type.ilike(f"%{search_value}%")
                )
            )

    # Lấy kết quả
    boxes = query_boxes.all()
    cameras = query_cameras.all()

    # Format kết quả
    results = []
    for box in boxes:
        results.append({
            "box_code": box.box_code or '-',
            "box_ip": box.box_ip or '-',
            "camera_name": '-',
            "camera_ip": '-',
            "camera_code": '-'
        })
    for cam in cameras:
        box = cam.box
        results.append({
            "box_code": box.box_code if box else '-',
            "box_ip": box.box_ip if box else '-',
            "camera_name": cam.camera_name or cam.camera_serial or '-',
            "camera_ip": cam.camera_ip or '-',
            "camera_code": cam.camera_code or '-'
        })

    return jsonify({
        "total": len(results),
        "results": results
    })