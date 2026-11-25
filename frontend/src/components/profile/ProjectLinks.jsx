import React from 'react';
import Card from '../common/Card';
import { Code2, Palette, FileText, Send, ExternalLink } from 'lucide-react';

/**
 * Component 4 Liên kết tài nguyên dự án (GitHub, Figma, Postman, PDF Report)
 */
export default function ProjectLinks({ links }) {
  const resourceList = [
    {
      id: 'github',
      title: 'GitHub Repository',
      desc: 'Mã nguồn toàn bộ dự án',
      url: links?.github || 'https://github.com',
      icon: Code2,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'figma',
      title: 'Figma UI/UX Design',
      desc: 'Bản vẽ thiết kế giao diện',
      url: links?.figma || 'https://figma.com',
      icon: Palette,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'postman',
      title: 'Postman Collection',
      desc: 'Bộ sưu tập & Môi trường API',
      url: links?.postman || 'https://web.postman.co',
      icon: Send,
      iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      id: 'swagger',
      title: 'Swagger API UI',
      desc: 'Tài liệu OpenAPI 3.0 trực quan',
      url: 'http://localhost:5000/api-docs',
      icon: FileText,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'pdf',
      title: 'Tài Liệu Báo Cáo PDF',
      desc: 'Báo cáo Bài Thực Hành',
      url: links?.pdfReport || 'https://drive.google.com',
      icon: FileText,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <Card title="Tài Nguyên & Liên Kết Dự Án">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
        {resourceList.map((res) => {
          const Icon = res.icon;

          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors group"
            >
              <div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${res.iconBg} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {res.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                <span>Mở liên kết</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </Card>
  );
}
