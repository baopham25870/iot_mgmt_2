// src/pages/Dashboard.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="h6">
        Xin chào, {user?.full_name || user?.username || 'Người dùng'}!
      </Typography>

      <Typography variant="body1" sx={{ mt: 2 }}>
        Vai trò: {user?.role || 'Không xác định'}
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 4 }}
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Đăng xuất
      </Button>

      {/* Thêm nội dung dashboard sau: bảng location, box, camera... */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          (Trang dashboard đang phát triển - sẽ hiển thị danh sách vị trí, box, camera)
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;