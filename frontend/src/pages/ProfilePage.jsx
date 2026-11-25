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
  avatarUrl: '/avatar.JPG',
  projectName: 'Hệ Thống Giám Sát Môi Trường & Điều Khiển Thiết Bị IoT (ESP32)',
  description: 'Đo nhiệt độ, độ ẩm, ánh sáng và điều khiển đèn LED qua MQTT.',
  links: {
    github: 'https://github.com/snowhallo/IoT_Project',
    figma: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
    postman:
      'https://www.postman.com/orbital-module-astronaut-7150237-s-team/iot/documentation/g22escv/iot-esp32-smart-monitoring-device-control-api',
    pdfReport: 'https://drive.google.com/drive/u/1/folders/1vq5omX9j8ebJ3Qua_N4YeqqL9p5pguI5',
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await apiService.getProfile();
      if (p) {
        setProfile((prev) => ({
          ...prev,
          ...p,
          avatarUrl: p.avatarUrl || prev.avatarUrl || '/avatar.JPG',
          links: {
            ...prev.links,
            ...(p.links || {}),
            pdfReport:
              p.links?.pdfReport && !p.links.pdfReport.includes('sample-iot-report-pdf')
                ? p.links.pdfReport
                : prev.links.pdfReport,
            github:
              p.links?.github && !p.links.github.includes('your-username')
                ? p.links.github
                : prev.links.github,
          },
        }));
      }
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
        title="Thông Tin Cá Nhân"
        subtitle="Thông tin sinh viên và tài liệu bài tập lớn"
      />

      {/* 1. Thông tin sinh viên */}
      <ProfileInfo profile={profile} onUpdateProfile={handleUpdateProfile} />

      {/* 2. Bốn liên kết tài nguyên dự án (GitHub, Figma, Postman, Báo cáo PDF) */}
      <ProjectLinks links={profile.links} />
    </div>
  );
}
