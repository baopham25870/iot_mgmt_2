// src/pages/GeneralSearch.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

interface SearchResult {
  box_code?: string;
  box_ip?: string;
  camera_name?: string;
  camera_ip?: string;
  camera_code?: string;
}

const GeneralSearchPage: React.FC = () => {
  const [locations, setLocations] = useState<{ code: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchValue, setSearchValue] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Lấy danh sách locations khi mount
  useEffect(() => {
    axios.get('/api/locations')
      .then(res => {
        const locs = res.data.map((l: any) => ({
          code: l.location_code || 'N/A',
          name: l.location_name || 'Không tên'
        }));
        setLocations([{ code: 'all', name: 'Show all locations' }, ...locs]);
      })
      .catch(err => {
        console.error('Lỗi lấy locations:', err);
        setError('Không thể tải danh sách địa điểm');
      });
  }, []);

  // Hàm load dữ liệu (dùng chung cho search và auto-load location)
  const loadData = async (locCode?: string, val?: string) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const params: any = {
        type: 'all',
      };

      if (locCode && locCode !== 'all') {
        params.location_code = locCode;
      }

      if (val && val.trim()) {
        params.value = val.trim();
      }

      console.log('Params gửi đi:', params);

      const res = await axios.get('/api/search', { params });
      console.log('Kết quả từ API:', res.data);

      const formatted = (res.data.results || []).map((item: any) => ({
        box_code: item.box_code || '-',
        box_ip: item.box_ip || '-',
        camera_code: item.camera_code || '-',
        camera_name: item.camera_name || item.camera_serial || '-',
        camera_ip: item.camera_ip || '-',
      }));

      setResults(formatted);

      if (formatted.length === 0) {
        setSnackbar({
          open: true,
          message: 'Không tìm thấy dữ liệu cho vị trí này',
          severity: 'info',
        });
      }
    } catch (err: any) {
      console.error('Lỗi:', err);
      const errorMsg = err.response?.data?.error || 'Lỗi khi tải dữ liệu';
      setError(errorMsg);
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-load khi thay đổi location (không cần nhập từ khóa)
  useEffect(() => {
      loadData(selectedLocation, searchValue);

  }, [selectedLocation]);

  // Tìm kiếm khi nhấn nút hoặc Enter (giữ nguyên)
  const handleSearch = () => {
    loadData(selectedLocation, searchValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Tiêu đề */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        General Search
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Phần input & dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Dropdown locations */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="location-label">Show all locations</InputLabel>
          <Select
            labelId="location-label"
            value={selectedLocation}
            label="Show all locations"
            onChange={(e) => setSelectedLocation(e.target.value)}
            size="small"
          >
            {locations.map(loc => (
              <MenuItem key={loc.code} value={loc.code}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Input search */}
        <TextField
          sx={{ flex: 1, minWidth: 300 }}
          label="Search box / camera"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          size="small"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <Button
                variant="contained"
                size="small"
                onClick={handleSearch}
                disabled={loading || !searchValue.trim()}
                sx={{ minWidth: 40, p: 0.5 }}
              >
                <SearchIcon fontSize="small" />
              </Button>
            ),
          }}
        />
      </Box>

      {/* Bảng kết quả */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="general search table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Box Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Box IP</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Camera Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Camera Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Camera IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có kết quả nào
                </TableCell>
              </TableRow>
            ) : (
              results.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.box_code}</TableCell>
                  <TableCell>{row.box_ip}</TableCell>
                  <TableCell>{row.camera_code}</TableCell>
                  <TableCell>{row.camera_name}</TableCell>
                  <TableCell>{row.camera_ip}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneralSearchPage;