CREATE TABLE locations (
    location_id     BIGSERIAL PRIMARY KEY,
    location_name   VARCHAR(150) NOT NULL,
    location_code   VARCHAR(50) UNIQUE,
    location_address VARCHAR(255),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boxes (
    box_id          BIGSERIAL PRIMARY KEY,
    box_name        VARCHAR(100) NOT NULL,
    box_ip          VARCHAR(45),
    box_netmask     VARCHAR(45),
    box_gateway     VARCHAR(45),
    box_dns         VARCHAR(45),
    box_ntp         VARCHAR(45),
    location_id     BIGINT NOT NULL,
    box_status      VARCHAR(20) DEFAULT 'active'
        CHECK (box_status IN ('active', 'offline', 'maintenance')),
    installed_at    DATE,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_boxes_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_boxes_location ON boxes(location_id);

CREATE TABLE cameras (
    camera_id       BIGSERIAL PRIMARY KEY,
    camera_serial   VARCHAR(100) UNIQUE NOT NULL,
    camera_name     VARCHAR(100) NOT NULL,
    camera_model    VARCHAR(100),
    camera_type     VARCHAR(10),
    camera_ip       VARCHAR(45),
    camera_netmask  VARCHAR(45),
    camera_gateway  VARCHAR(45),
    camera_dns      VARCHAR(45),
    camera_ntp      VARCHAR(45),
    location_id     BIGINT NOT NULL,
    box_id          BIGINT,                    -- NULL = chưa kết nối / camera độc lập
    stream_url      VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'offline', 'error')),
    resolution      VARCHAR(20),
    installed_at    DATE,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cameras_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_cameras_box
        FOREIGN KEY (box_id) REFERENCES boxes(box_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_cameras_location ON cameras(location_id);
CREATE INDEX idx_cameras_box      ON cameras(box_id);
CREATE INDEX idx_cameras_serial   ON cameras(camera_serial);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_locations_update
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trig_boxes_update
    BEFORE UPDATE ON boxes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trig_cameras_update
    BEFORE UPDATE ON cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TABLE users (
    user_id         BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)     UNIQUE NOT NULL,
    email           VARCHAR(100)    UNIQUE,                  -- optional, có thể dùng để recover password sau này
    password_hash   VARCHAR(255)    NOT NULL,                -- lưu bcrypt hash, KHÔNG lưu plain password
    full_name       VARCHAR(100),
    role            VARCHAR(30)     DEFAULT 'user'
        CHECK (role IN ('admin', 'user', 'viewer')),         -- phân quyền: admin tạo user, viewer chỉ xem
    is_active       BOOLEAN         DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);

CREATE TRIGGER trig_users_update
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TABLE user_sessions (
    session_id      BIGSERIAL PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    token_jti       VARCHAR(36)     UNIQUE NOT NULL,         -- JWT JTI để invalidate nếu cần
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMPTZ     NOT NULL,                -- thời gian hết hạn token
    is_revoked      BOOLEAN         DEFAULT FALSE,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id   ON user_sessions(user_id);
CREATE INDEX idx_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX idx_sessions_expires   ON user_sessions(expires_at);
