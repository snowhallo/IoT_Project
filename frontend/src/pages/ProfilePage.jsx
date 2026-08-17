import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProjectLinks from '../components/profile/ProjectLinks';
import { apiService } from '../services/apiService';

const defaultProfile = {
  fullName: 'Nguyễn Tuấn Tài',
  studentId: 'B23DCCN731',
  className: 'D23CQCN03-B',
  school: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  email: 'TaiNT.B23CN731@stu.ptit.edu.vn',
  avatarUrl: '',
  projectName: 'Hệ Thống Giám Sát Môi Trường & Điều Khiển Thiết Bị IoT (ESP32)',
  description: 'Đo nhiệt độ, độ ẩm, ánh sáng và điều khiển đèn LED qua MQTT.',
  links: {
    github: 'https://github.com/your-username/iot-esp32-project',
    figma: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
    pdfReport: 'https://drive.google.com/file/d/sample-iot-report-pdf/view',
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await apiService.getProfile();
      if (p) setProfile(p);
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (newProfile) => {
    const updated = await apiService.updateProfile(newProfile);
    if (updated) setProfile(updated);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Hồ Sơ Thông Tin Cá Nhân"
        subtitle="Hồ sơ sinh viên thực hiện, liên kết GitHub, Figma và Báo cáo PDF"
      />

      {/* 1. Thông tin sinh viên */}
      <ProfileInfo profile={profile} onUpdateProfile={handleUpdateProfile} />

      {/* 2. Ba liên kết tài nguyên bắt buộc (GitHub, Figma, Báo cáo PDF) */}
      <ProjectLinks links={profile.links} />
    </div>
  );
}
