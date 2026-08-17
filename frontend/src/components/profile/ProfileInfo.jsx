import React, { useState } from 'react';
import Card from '../common/Card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { User, GraduationCap, School, Edit3, Check } from 'lucide-react';

export default function ProfileInfo({ profile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [imageError, setImageError] = useState(false);

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    setImageError(false);
  };

  const hasAvatar = Boolean(profile.avatarUrl && profile.avatarUrl.trim() && !imageError);

  return (
    <Card
      title="Thông Tin Sinh Viên Thực Hiện"
      action={
        <Button
          variant={isEditing ? 'success' : 'outline'}
          size="sm"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="gap-1.5"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Lưu Thông Tin
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh Sửa
            </>
          )}
        </Button>
      }
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-300 flex items-center justify-center shrink-0">
          {hasAvatar ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Thông tin */}
        <div className="flex-1 w-full space-y-3 text-center md:text-left">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Họ và Tên:</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Mã Sinh Viên:</label>
                <Input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Lớp:</label>
                <Input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Trường Đào Tạo:</label>
                <Input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-medium">Link Ảnh Avatar (Tùy chọn):</label>
                <Input
                  type="text"
                  value={formData.avatarUrl || ''}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="Để trống sẽ dùng icon profile mặc định"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  {profile.fullName}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Mã Sinh Viên</div>
                    <div className="text-sm font-mono font-bold text-slate-800">{profile.studentId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <User className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Lớp Sinh Hoạt</div>
                    <div className="text-sm font-semibold text-slate-800">{profile.className}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                  <School className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Đơn Vị Đào Tạo</div>
                    <div className="text-sm font-medium text-slate-800">{profile.school}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
