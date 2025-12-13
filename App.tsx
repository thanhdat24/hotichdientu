import React, { useState, useEffect, useMemo } from 'react';
import { ENDPOINT_LABELS, ICON_MAP, COLORS, DEFAULT_API_BASE_URL } from './constants';
import { fetchAllStats } from './services/api';
import { StatResult } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Settings, RefreshCw, AlertTriangle, CheckCircle, Lock, LayoutDashboard, FileText, Database, Server, Info, Globe 
} from 'lucide-react';

const App: React.FC = () => {
  // State for Configuration
  const [token, setToken] = useState<string>(() => localStorage.getItem('BEARER_TOKEN') || '');
  const [useMock, setUseMock] = useState<boolean>(() => localStorage.getItem('USE_MOCK') === 'true');

  // State for Data
  const [stats, setStats] = useState<StatResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);

  // Initial load
  useEffect(() => {
    // If we have a token OR we are in mock mode, load data
    if (token || useMock) {
      handleRefresh();
    } else {
      setShowSettings(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsSave = (newToken: string, newMockMode: boolean) => {
    const cleanedToken = newToken.trim();
    
    // Save to State
    setToken(cleanedToken);
    setUseMock(newMockMode);

    // Save to LocalStorage
    localStorage.setItem('BEARER_TOKEN', cleanedToken);
    localStorage.setItem('USE_MOCK', String(newMockMode));

    setShowSettings(false);
    
    // Reset states before fetching
    setUnauthorized(false);
    setNetworkError(false);
    setErrorCount(0);
    
    // Trigger fetch with new settings
    setTimeout(() => handleRefresh(cleanedToken, newMockMode), 100);
  };

  const handleRefresh = async (
    currentToken: string = token, 
    currentMock: boolean = useMock
  ) => {
    if (!currentToken && !currentMock) return;

    setLoading(true);
    setUnauthorized(false);
    setNetworkError(false);
    setErrorCount(0);
    
    // Set placeholder loading stats
    const placeholders = ENDPOINT_LABELS.map(label => ({
      label, count: 0, loading: true, error: false
    }));
    setStats(placeholders);

    // Fetch data using the service with fixed DEFAULT_API_BASE_URL
    const results = await fetchAllStats(currentToken, DEFAULT_API_BASE_URL, currentMock);
    
    setStats(results);
    setLoading(false);

    // Check for global issues (only if not in mock mode)
    if (!currentMock) {
      const isUnauth = results.some(r => r.unauthorized);
      if (isUnauth) setUnauthorized(true);

      const isNetErr = results.some(r => r.networkError);
      if (isNetErr) setNetworkError(true);

      // Count generic errors that aren't auth or network
      const errors = results.filter(r => r.error && !r.unauthorized && !r.networkError).length;
      setErrorCount(errors);
    }
  };

  const totalRecords = useMemo(() => stats.reduce((acc, curr) => acc + curr.count, 0), [stats]);

  // Transform data for chart
  const chartData = useMemo(() => {
    return stats.map(s => ({
      name: s.label.replace('Đăng ký ', '').replace('việc ', ''), // Shorten names
      fullLabel: s.label,
      value: s.count
    }));
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Thống Kê Hộ Tịch</h1>
            <h1 className="text-xl font-bold text-gray-900 sm:hidden">Hộ Tịch</h1>
            {useMock && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                DEMO MODE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-gray-400">Trạng thái API</span>
                {unauthorized ? (
                   <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                     <Lock size={10} /> 401 Unauthorized
                   </span>
                ) : networkError ? (
                   <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                     <Globe size={10} /> Lỗi Kết Nối
                   </span>
                ) : errorCount > 0 ? (
                    <span className="text-xs font-bold text-orange-500">Lỗi dữ liệu ({errorCount})</span>
                ) : loading ? (
                    <span className="text-xs font-bold text-blue-500">Đang tải...</span>
                ) : useMock ? (
                  <span className="text-xs font-bold text-yellow-600">Dữ liệu giả lập</span>
                ) : (
                    <span className="text-xs font-bold text-green-500">Sẵn sàng</span>
                )}
             </div>

            <button
              onClick={() => handleRefresh()}
              disabled={loading || (!token && !useMock)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin text-blue-500' : 'text-gray-600'}`}
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cấu hình</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Alerts */}
        {unauthorized && !useMock && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-red-800 font-bold">Lỗi Xác Thực (401)</h3>
                <p className="text-red-700 text-sm mt-1">
                  Token hiện tại đã hết hạn hoặc không hợp lệ. Vui lòng cập nhật Bearer Token mới trong phần cấu hình.
                </p>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                >
                  Cập nhật ngay
                </button>
              </div>
            </div>
          </div>
        )}
        
        {networkError && !useMock && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md shadow-sm">
            <div className="flex items-start">
              <Globe className="w-5 h-5 text-orange-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-orange-800 font-bold">Lỗi Kết Nối (CORS Proxy)</h3>
                <p className="text-orange-700 text-sm mt-1">
                  Hệ thống đang sử dụng Proxy trung gian để kết nối đến <strong>{DEFAULT_API_BASE_URL}</strong> (để vượt lỗi CORS).
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  Tuy nhiên, kết nối vẫn thất bại. Nguyên nhân có thể do:
                </p>
                <ul className="list-disc pl-5 mt-1 text-sm text-orange-800 space-y-1">
                   <li>Token không chính xác hoặc Server từ chối xử lý qua Proxy.</li>
                   <li>Mạng nội bộ (Firewall) chặn truy cập đến <strong>corsproxy.io</strong>.</li>
                   <li>Server Moj đang bảo trì.</li>
                </ul>
                <button 
                  onClick={() => handleSettingsSave(token, true)}
                  className="mt-3 text-sm font-bold text-orange-800 hover:text-orange-900 underline flex items-center gap-1"
                >
                  <Database className="w-4 h-4" /> Bật Chế độ Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Stats */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-white">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-lg font-semibold text-gray-700">Tổng Hồ Sơ</h2>
                 <p className="text-sm text-gray-500">
                   {useMock ? 'Dữ liệu giả lập (Demo)' : 'Tổng hợp tất cả các danh mục'}
                 </p>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {loading ? '...' : totalRecords.toLocaleString('vi-VN')}
              </div>
           </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ENDPOINT_LABELS.map((key, index) => {
            const stat = stats.find(s => s.label === key) || { count: 0, loading: false, error: false };
            const Icon = ICON_MAP[key] || FileText;
            const color = COLORS[index % COLORS.length];
            
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden relative group">
                <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: color }}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: color }} />
                    </div>
                    {stat.loading && <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-300 animate-spin"></div>}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 line-clamp-1" title={key}>{key}</h3>
                    <div className="mt-1 flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.error ? '-' : stat.count.toLocaleString('vi-VN')}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">hồ sơ</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Biểu Đồ Phân Bố Hồ Sơ</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [value.toLocaleString('vi-VN'), 'Hồ sơ']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Cấu hình hệ thống</h2>
              {(token || useMock) && (
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Đóng</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="overflow-y-auto space-y-6 px-1 pb-2">
              
              {/* API Connection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Server className="w-5 h-5" />
                  <span className="font-semibold text-sm">Kết nối Backend</span>
                </div>
                
                <div className="text-xs text-gray-500 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>
                    API URL cố định: <strong className="font-mono text-gray-700">{DEFAULT_API_BASE_URL}</strong>
                  </span>
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1 pl-6">
                   <Globe size={12} />
                   <span>Đã tự động kích hoạt Proxy để vượt lỗi CORS</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bearer Token
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono h-24 resize-none"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    defaultValue={token}
                    id="token-input"
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-500">
                    Token được sử dụng để xác thực với hệ thống Hộ Tịch Điện Tử.
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Demo Mode Section */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-800">
                       <Database className="w-5 h-5" />
                       <span className="font-semibold text-sm">Chế độ Demo</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="mock-toggle" 
                        defaultChecked={useMock} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>
                 <p className="text-xs text-gray-500">
                    Bật chế độ này để xem giao diện với dữ liệu giả lập (không cần Token). Thích hợp để test UI.
                 </p>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const tokenVal = (document.getElementById('token-input') as HTMLTextAreaElement).value;
                  const mockVal = (document.getElementById('mock-toggle') as HTMLInputElement).checked;
                  handleSettingsSave(tokenVal, mockVal);
                }}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;