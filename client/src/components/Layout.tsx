import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import BatchStatus from "./BatchStatus";
import { Bell } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const getPageInfo = (path: string) => {
    switch (path) {
      case "/":
      case "/dashboard":
        return { title: "대시보드", description: "전체 현황을 한눈에 확인하세요" };
      case "/students":
        return { title: "학생 관리", description: "학생 정보를 등록하고 관리하세요" };
      case "/reports":
        return { title: "수업 보고서", description: "수업 내용을 기록하고 AI 보고서를 생성하세요" };
      case "/analytics":
        return { title: "분석 리포트", description: "학생들의 성과와 진도를 상세히 분석하세요" };
      case "/settings":
        return { title: "설정", description: "계정 정보와 시스템 설정을 관리하세요" };
      default:
        return { title: "Tutor's Insight", description: "프리미엄 과외 관리 시스템" };
    }
  };

  const { title, description } = getPageInfo(location);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BatchStatus />
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-slate-400" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
