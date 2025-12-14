import { 
  Baby, FileText, Heart, Users, Shield, ShieldCheck, UserPlus, Files, 
  HeartHandshake, HeartCrack, FilePenLine, FileCheck
} from 'lucide-react';

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
  "Đăng ký kết hôn",
  "Đăng ký khai tử",
  "Cấp bản sao trích lục",
  "XNTT Hôn nhân",
  "Đăng ký giám hộ",
  "Đăng ký giám sát việc giám hộ",
  "Đăng ký nhận cha, mẹ, con",
  "Đăng ký nhận con nuôi",
  "Việc ly hôn, hủy việc kết hôn ở nước ngoài",
  "Cấp văn bản xác nhận thông tin hộ tịch",
  "Đăng ký thay đổi/bổ sung/cải chính"
] as const;

/**
 * Icon cho từng label
 */
export const ICON_MAP: Record<string, any> = {
  "Đăng ký khai sinh": Baby,
   "Đăng ký kết hôn": Heart,
  "Đăng ký khai tử": FileText,
  "Cấp bản sao trích lục": Files,
  "XNTT Hôn nhân": Shield,
  "Đăng ký giám hộ": ShieldCheck,
  "Đăng ký giám sát việc giám hộ": Users,
  "Đăng ký nhận cha, mẹ, con": UserPlus,
  "Đăng ký thay đổi/bổ sung/cải chính": FilePenLine,
  "Đăng ký nhận con nuôi": HeartHandshake,
  "Việc ly hôn, hủy việc kết hôn ở nước ngoài": HeartCrack,
  "Cấp văn bản xác nhận thông tin hộ tịch": FileCheck
};

/**
 * Màu cho card & chart
 */
export const COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
  "#64748b"  // Slate (New)
];