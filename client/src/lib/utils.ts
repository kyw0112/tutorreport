import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: string = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

export function formatDateTime(date: string | Date, locale: string = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

export function getInitials(name: string): string {
  return name.charAt(0);
}

export function getProgressColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 85) return 'green';
  if (score >= 70) return 'amber';
  return 'red';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-blue-100 text-blue-800';
  if (score >= 70) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function calculateProgress(reports: any[]): number {
  if (!reports || reports.length === 0) return 0;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentReports = reports.filter(report => 
    new Date(report.classDate) >= weekAgo
  );
  
  if (recentReports.length === 0) return 0;
  
  const totalScore = recentReports.reduce((sum, report) => 
    sum + (report.homeworkScore || 0), 0
  );
  
  return Math.round(totalScore / recentReports.length);
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else {
    return `${diffDays}일 전`;
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
}

export function getGradeLevel(grade: string): 'elementary' | 'middle' | 'high' | 'unknown' {
  if (grade.includes('초등')) return 'elementary';
  if (grade.includes('중학')) return 'middle';
  if (grade.includes('고등')) return 'high';
  return 'unknown';
}

export function sortByDate(items: any[], dateField: string, order: 'asc' | 'desc' = 'desc'): any[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime();
    const dateB = new Date(b[dateField]).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}
