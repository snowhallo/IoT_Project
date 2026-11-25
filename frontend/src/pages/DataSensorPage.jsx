import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import SensorFilter from '../components/data-sensor/SensorFilter';
import SensorSearch from '../components/data-sensor/SensorSearch';
import SensorTable from '../components/data-sensor/SensorTable';
import Pagination from '../components/common/Pagination';
import { apiService } from '../services/apiService';
import { matchFlexibleTime } from '../utils/timeSearchHelper';

export default function DataSensorPage() {
  const [dataSensors, setDataSensors] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ type: 'all', search: '' });
  const [sortConfig, setSortConfig] = useState({ field: null, order: 'none' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      const list = await apiService.getDataSensors({ limit: 1000 });
      setDataSensors(Array.isArray(list) ? list : (list?.records || list?.data || []));
    };
    loadData();
  }, []);

  // Xử lý kích hoạt tìm kiếm & lọc khi ấn nút Tìm kiếm hoặc Enter
  const handleSearch = () => {
    setAppliedFilter({
      type: selectedType,
      search: searchTerm.trim(),
    });
    setCurrentPage(1);
  };

  // Đặt lại bộ lọc và ô tìm kiếm về mặc định
  const handleReset = () => {
    setSelectedType('all');
    setSearchTerm('');
    setAppliedFilter({ type: 'all', search: '' });
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Chuyển đổi luân phiên: none -> asc -> desc -> none khi click vào tiêu đề cột
  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field !== field) {
        return { field, order: 'asc' };
      }
      if (prev.order === 'asc') {
        return { field, order: 'desc' };
      }
      return { field: null, order: 'none' };
    });
  };

  // Lọc, Tìm kiếm và Sắp xếp dữ liệu cảm biến theo 4 tiêu chí (chỉ lọc khi ấn Tìm kiếm)
  const filteredData = useMemo(() => {
    const query = appliedFilter.search.toLowerCase();
    const type = appliedFilter.type;

    const list = dataSensors.filter((item) => {
      // 1. Tiêu chí Thời gian: Lọc theo mốc thời gian (cắt dần giây -> phút -> giờ -> ngày)
      if (type === 'time') {
        return query ? matchFlexibleTime(item.timestamp, query) : true;
      }

      // 2. Tiêu chí Nhiệt độ, Độ ẩm, Ánh sáng hoặc Khí Gas: Lọc theo loại và giá trị đo
      if (type === 'temperature' || type === 'humidity' || type === 'light' || type === 'gas') {
        const isSameType = item.type?.toLowerCase() === type;
        if (!isSameType) return false;
        // Nếu người dùng nhập giá trị đo -> lọc theo giá trị đo
        return query ? String(item.value).toLowerCase().includes(query) : true;
      }

      // 3. Tiêu chí 'all' (Tất cả dữ liệu): Khớp thời gian HOẶC Khớp giá trị đo
      if (query) {
        const matchTime = matchFlexibleTime(item.timestamp, query);
        const matchVal = String(item.value).toLowerCase().includes(query);
        return matchTime || matchVal;
      }

      return true;
    });

    // 4. Sắp xếp dữ liệu theo trường đã chọn (Giá trị đo hoặc Thời gian)
    if (sortConfig.field === 'value') {
      if (sortConfig.order === 'asc') {
        return [...list].sort((a, b) => Number(a.value) - Number(b.value));
      }
      if (sortConfig.order === 'desc') {
        return [...list].sort((a, b) => Number(b.value) - Number(a.value));
      }
    } else if (sortConfig.field === 'time') {
      if (sortConfig.order === 'asc') {
        return [...list].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
      if (sortConfig.order === 'desc') {
        return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    }

    // Mặc định: Giữ nguyên thứ tự thời gian mới nhất
    return list;
  }, [dataSensors, appliedFilter, sortConfig]);

  // Reset về trang 1 khi appliedFilter, page size hoặc sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, sortConfig]);

  // Phân trang dữ liệu
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const hasActiveFilter =
    appliedFilter.type !== 'all' ||
    appliedFilter.search !== '' ||
    selectedType !== 'all' ||
    searchTerm !== '';

  return (
    <div className="space-y-6">
      <Header
        title="Dữ Liệu Cảm Biến"
        subtitle="Xem và tra cứu lịch sử đo đạc từ cảm biến"
      />

      <Card>
        {/* Thanh công cụ: Ô tìm kiếm BÊN TRÁI, Dropdown lọc BÊN PHẢI */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          {/* BÊN TRÁI: Ô tìm kiếm theo giá trị đo / thời gian + Nút Tìm kiếm */}
          <SensorSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={handleClearSearch}
            onSearch={handleSearch}
            onReset={handleReset}
            hasFilter={hasActiveFilter}
            filterType={selectedType}
          />

          {/* BÊN PHẢI: Dropdown lọc 4 tiêu chí (Nhiệt độ, Độ ẩm, Ánh sáng, Thời gian) */}
          <div className="flex items-center gap-3 shrink-0">
            <SensorFilter
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          </div>
        </div>

        {/* Bảng dữ liệu cảm biến (hỗ trợ click tiêu đề để sắp xếp) */}
        <div className="mt-4">
          <SensorTable
            data={paginatedData}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
