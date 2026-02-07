import os
import sys

# Thêm đường dẫn gốc dự án vào sys.path (rất quan trọng!)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

print("DEBUG: Đã thêm project_root vào sys.path:", project_root)
print("DEBUG: sys.path hiện tại:", sys.path)

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy import create_engine

from alembic import context
from app import db

# Load .env sớm
from dotenv import load_dotenv
load_dotenv()

# Import tất cả model (để Alembic tự động lấy metadata)
try:
    from app.models.location import Location
    from app.models.box import Box
    from app.models.camera import Camera
    from app.models.user import User
    from app.models.session import UserSession
    print("DEBUG: Đã import tất cả model thành công")
except ImportError as e:
    print("DEBUG: Import model thất bại:", str(e))
    raise

# Gán target_metadata từ db.Model.metadata (Alembic sẽ dùng metadata từ các model đã import)
target_metadata = db.Model.metadata

# Debug database URL
db_url = os.getenv("DATABASE_URL")

# Alembic Config object
config = context.config

# Override sqlalchemy.url từ .env
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)
    print("Đã override sqlalchemy.url từ .env thành công")
else:
    print("Không override được → fallback về alembic.ini (nếu có)")

# Logging config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ────────────────────────────────────────────────
# Các hàm run_migrations_offline và online
# ────────────────────────────────────────────────

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        raise ValueError("No sqlalchemy.url found in config (check .env or alembic.ini)")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        raise ValueError("No sqlalchemy.url found in config (check .env or alembic.ini)")

    connectable = create_engine(url)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()