import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Code2, Palette, FileText, ExternalLink } from 'lucide-react';

/**
 * Component 3 Liên kết tài nguyên bắt buộc (GitHub, Figma, PDF Report)
 */
export default function ProjectLinks({ links }) {
  const resourceList = [
    {
      id: 'github',
      title: 'GitHub Repository',
      desc: 'Mã nguồn toàn bộ dự án',
      url: links?.github || 'https://github.com',
      icon: Code2,
      iconBg: 'bg-slate-100 text-slate-800 border-slate-200',
      badge: 'Source Code',
      variant: 'default',
    },
    {
      id: 'figma',
      title: 'Figma UI/UX Design',
      desc: 'Bản vẽ thiết kế giao diện',
      url: links?.figma || 'https://figma.com',
      icon: Palette,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Figma Canvas',
      variant: 'purple',
    },
    {
      id: 'pdf',
      title: 'Tài Liệu Báo Cáo PDF',
      desc: 'Báo cáo Bài Thực Hành',
      url: links?.pdfReport || 'https://drive.google.com',
      icon: FileText,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: 'PDF Document',
      variant: 'danger',
    },
  ];

  return (
    <Card
      title="Tài Nguyên & Liên Kết Dự Án"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {resourceList.map((res) => {
          const Icon = res.icon;

          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${res.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={res.variant} size="sm">
                    {res.badge}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {res.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>Truy cập liên kết</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </Card>
  );
}
