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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadHistory = async () => {
      const list = await apiService.getHistory();
      setHistoryList(list);
    };
    loadHistory();
  }, []);

  // Lọc theo Tên thiết bị, Hành động và Thời gian
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      // 1. Lọc theo Hành động (Action)
      const matchAction = actionFilter === 'all' || item.action === actionFilter;

      // 2. Tìm kiếm theo Tên thiết bị HOẶC theo Mốc thời gian
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchDeviceName = item.deviceName.toLowerCase().includes(cleanSearch);
      const matchTime = matchFlexibleTime(item.timestamp, searchTerm);

      const matchSearch = !cleanSearch || matchDeviceName || matchTime;

      return matchAction && matchSearch;
    });
  }, [historyList, searchTerm, actionFilter]);

  // Reset về trang 1 khi lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter]);

  // Phân trang dữ liệu
  const paginatedHistory = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIdx, startIdx + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <Header
        title="Lịch Sử Điều Khiển Thiết Bị (History)"
        subtitle="Theo dõi nhật ký thao tác người dùng và phản hồi thực tế từ phần cứng"
      />

      <Card>
        {/* Thanh tìm kiếm và bộ lọc hành động */}
        <div className="pb-5 border-b border-slate-100">
          <HistorySearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
          />
        </div>

        {/* Bảng lịch sử 5 cột bắt buộc */}
        <div className="mt-4">
          <HistoryTable data={paginatedHistory} />
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredHistory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
