import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import HistorySearch from '../components/history/HistorySearch';
import HistoryTable from '../components/history/HistoryTable';
import Pagination from '../components/common/Pagination';
import { apiService } from '../services/apiService';
import { matchFlexibleTime } from '../utils/timeSearchHelper';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [timeSearch, setTimeSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeSortOrder, setTimeSortOrder] = useState('none'); // 'none' | 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadHistory = async () => {
      const list = await apiService.getHistory({ limit: 1000 });
      setHistoryList(Array.isArray(list) ? list : (list?.data || []));
    };
    loadHistory();
  }, []);

  const handleToggleTimeSort = () => {
    setTimeSortOrder((prev) => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  // Lọc đa chiều: Thiết bị, Mốc thời gian cắt dần, Hành động, Trạng thái phản hồi & Sắp xếp thời gian
  const filteredHistory = useMemo(() => {
    const list = historyList.filter((item) => {
      // 1. Lọc theo Thiết bị (Device Filter)
      const matchDevice =
        deviceFilter === 'all' ||
        item.deviceId === Number(deviceFilter) ||
        (deviceFilter === '1' && item.deviceName?.includes('1')) ||
        (deviceFilter === '2' && item.deviceName?.includes('2')) ||
        (deviceFilter === '3' && item.deviceName?.includes('3')) ||
        (deviceFilter === '4' && item.deviceName?.includes('4'));

      // 2. Tìm kiếm theo Mốc thời gian cắt dần (Prefix Time Search)
      const matchTime = matchFlexibleTime(item.timestamp, timeSearch);

      // 3. Lọc theo Hành động (Action Filter: BẬT, TẮT)
      const matchAction =
        actionFilter === 'all' ||
        item.action === actionFilter;

      // 4. Lọc theo Trạng thái phản hồi (Status Filter: BẬT, TẮT, TIMEOUT)
      const matchStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      return matchDevice && matchTime && matchAction && matchStatus;
    });

    // 5. Sắp xếp theo mốc thời gian thực hiện
    if (timeSortOrder === 'asc') {
      return [...list].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    if (timeSortOrder === 'desc') {
      return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Mặc định: Giữ nguyên thứ tự mới nhất
    return list;
  }, [historyList, timeSearch, deviceFilter, actionFilter, statusFilter, timeSortOrder]);

  // Reset về trang 1 khi bất kỳ điều kiện lọc, sort hoặc page size nào thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [timeSearch, deviceFilter, actionFilter, statusFilter, pageSize, timeSortOrder]);

  // Phân trang dữ liệu
  const paginatedHistory = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIdx, startIdx + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <Header
        title="Lịch Sử Điều Khiển"
        subtitle="Nhật ký các lần bật tắt thiết bị"
      />

      <Card>
        {/* Thanh tìm kiếm thời gian và bộ lọc đa tiêu chí */}
        <div className="pb-5 border-b border-slate-100">
          <HistorySearch
            timeSearch={timeSearch}
            onSearchChange={setTimeSearch}
            onClearSearch={() => setTimeSearch('')}
            deviceFilter={deviceFilter}
            onDeviceFilterChange={setDeviceFilter}
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Bảng lịch sử 5 cột bắt buộc */}
        <div className="mt-4">
          <HistoryTable
            data={paginatedHistory}
            timeSortOrder={timeSortOrder}
            onToggleTimeSort={handleToggleTimeSort}
          />
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredHistory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
