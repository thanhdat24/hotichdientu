import { Baby, FileText, Heart, Users, Shield, ShieldCheck, UserPlus, Files } from 'lucide-react';

/**
 * FE + BE cùng domain Vercel
 * => gọi relative path là nhanh & an toàn nhất
 */
export const DEFAULT_API_BASE_URL = "";

/**
 * Danh sách label để:
 * - render card
 * - map dữ liệu trả về từ backend
 */
export const ENDPOINT_LABELS = [
  "Đăng ký khai sinh",
  "Đăng ký khai tử",
  "Đăng ký kết hôn",
  "XNTT Hôn nhân",
  "Đăng ký giám hộ",
  "Đăng ký giám sát việc giám hộ",
  "Đăng ký nhận cha, mẹ, con",
  "Cấp bản sao trích lục"
] as const;

/**
 * Icon cho từng label
 */
export const ICON_MAP: Record<string, any> = {
  "Đăng ký khai sinh": Baby,
  "Đăng ký khai tử": FileText,
  "Đăng ký kết hôn": Heart,
  "XNTT Hôn nhân": Shield,
  "Đăng ký giám hộ": ShieldCheck,
  "Đăng ký giám sát việc giám hộ": Users,
  "Đăng ký nhận cha, mẹ, con": UserPlus,
  "Cấp bản sao trích lục": Files
};

/**
 * Màu cho card & chart
 */
export const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#6366f1"
];
