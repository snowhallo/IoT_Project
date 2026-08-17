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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadData = async () => {
      const list = await apiService.getDataSensors();
      setDataSensors(list);
    };
    loadData();
  }, []);

  // Lọc và Tìm kiếm dữ liệu theo yêu cầu logic của thầy giáo
  const filteredData = useMemo(() => {
    return dataSensors.filter((item) => {
      // 1. Lọc theo loại cảm biến
      const matchType =
        selectedType === 'all' || item.type.toLowerCase() === selectedType.toLowerCase();

      // 2. Tìm kiếm linh hoạt theo thời gian (cắt dần đơn vị giây -> phút -> giờ -> ngày)
      const matchTime = matchFlexibleTime(item.timestamp, searchTerm);

      return matchType && matchTime;
    });
  }, [dataSensors, selectedType, searchTerm]);

  // Reset về trang 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchTerm]);

  // Phân trang dữ liệu
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <Header
        title="Dữ Liệu Đo Đạc Cảm Biến (Data Sensors)"
        subtitle="Tra cứu, lọc theo loại cảm biến và tìm kiếm linh hoạt theo mốc thời gian"
      />

      <Card>
        {/* Thanh công cụ: Dropdown lọc loại & Tìm kiếm thời gian linh hoạt */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <SensorFilter
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          </div>

          <SensorSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        </div>

        {/* Bảng dữ liệu cảm biến */}
        <div className="mt-4">
          <SensorTable data={paginatedData} />
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
