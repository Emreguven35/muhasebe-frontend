import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('receipts'); // 'receipts' veya 'zreports'
  const [receipts, setReceipts] = useState([]);
  const [zReports, setZReports] = useState([]);
  const [stats, setStats] = useState({
    total_receipts: 0,
    total_amount: 0,
    total_vat: 0,
    category_count: 0,
    categories: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchReceipts(parsedUser.id);
    fetchZReports(parsedUser.id);
    fetchStats(parsedUser.id);
  } else {
    navigate('/login');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [navigate]);

  const fetchReceipts = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/receipts?userId=${userId}`);
      const data = await response.json();
      setReceipts(data);
    } catch (error) {
      console.error('Fişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZReports = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/z-reports?userId=${userId}`);
      const data = await response.json();
      setZReports(data);
    } catch (error) {
      console.error('Z Raporları yüklenirken hata:', error);
    }
  };

  const fetchStats = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard-stats?userId=${userId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('userId', user.id);

    try {
      const endpoint = activeTab === 'zreports' 
        ? `${API_URL}/api/upload-z-report`
        : `${API_URL}/api/upload`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(activeTab === 'zreports' ? 'Z Raporu başarıyla yüklendi!' : 'Fiş başarıyla yüklendi!');
        if (activeTab === 'zreports') {
          fetchZReports(user.id);
        } else {
          fetchReceipts(user.id);
          fetchStats(user.id);
        }
      } else {
        alert('Yükleme başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Upload hatası:', error);
      alert('Yükleme başarısız!');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu fişi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`${API_URL}/api/receipts/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchReceipts(user.id);
        fetchStats(user.id);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Fiş silinemedi!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const exportToExcel = async () => {
    try {
      if (receipts.length === 0) {
        alert('Excel\'e aktarılacak fiş bulunamadı!');
        return;
      }

      // Excel export kodu buraya eklenecek
      alert('Excel export özelliği yakında eklenecek!');
    } catch (error) {
      alert('❌ Excel indirme hatası: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Muhasebe Fiş Takip
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Merhaba, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Toplam Fiş</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.total_receipts || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Toplam Tutar</div>
            <div className="text-3xl font-bold text-green-600">
              ₺{parseFloat(stats.total_amount || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Toplam KDV</div>
            <div className="text-3xl font-bold text-purple-600">
              ₺{parseFloat(stats.total_vat || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Kategori Sayısı</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.category_count || 0}
            </div>
          </div>
        </div>

        {/* Tab Başlıkları */}
        <div className="flex gap-4 mb-6 border-b bg-white rounded-t-lg px-4">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'receipts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fişler ({receipts.length})
          </button>
          <button
            onClick={() => setActiveTab('zreports')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'zreports'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Z Raporları ({zReports.length})
          </button>
        </div>

        {/* Upload Butonu */}
        <div className="mb-6 flex gap-4">
          <label className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 inline-block">
            {uploading ? 'Yükleniyor...' : `${activeTab === 'zreports' ? 'Z Raporu' : 'Fiş'} Yükle`}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          {activeTab === 'receipts' && receipts.length > 0 && (
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            >
              📥 Excel İndir ({receipts.length} Fiş)
            </button>
          )}
        </div>

        {/* Tab İçeriği */}
        {activeTab === 'receipts' ? (
          // FİŞLER TAB
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Henüz fiş yüklemediniz. Yukarıdaki butonu kullanarak fiş yükleyebilirsiniz.</p>
              </div>
            ) : (
              receipts.map((receipt) => (
                <div key={receipt.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900">
                        {receipt.company_name || 'Firma Adı Yok'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {receipt.date ? new Date(receipt.date).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>

                  {receipt.category && (
                    <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                      {receipt.category}
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam:</span>
                      <span className="font-semibold">₺{parseFloat(receipt.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">KDV:</span>
                      <span className="text-purple-600">₺{parseFloat(receipt.vat || 0).toFixed(2)}</span>
                    </div>
                    {receipt.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödeme:</span>
                        <span>{receipt.payment_method}</span>
                      </div>
                    )}
                  </div>

                  {receipt.image_path && (
                    <img
                      src={`${API_URL}/${receipt.image_path}`}
                      alt="Fiş"
                      className="w-full h-40 object-cover rounded mt-3 cursor-pointer"
                      onClick={() => window.open(`${API_URL}/${receipt.image_path}`, '_blank')}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Z RAPORLARI TAB
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zReports.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Henüz Z Raporu yüklemediniz. Yukarıdaki butonu kullanarak Z Raporu yükleyebilirsiniz.</p>
              </div>
            ) : (
              zReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg text-gray-900">Z Raporu</div>
                      <div className="text-sm text-gray-500">
                        {report.report_date ? new Date(report.report_date).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {report.report_time || ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Fiş Sayısı</div>
                      <div className="font-bold text-blue-600 text-lg">{report.receipt_count || 0}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Satış:</span>
                      <span className="font-semibold">₺{parseFloat(report.total_sales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">KDV:</span>
                      <span className="text-purple-600 font-semibold">₺{parseFloat(report.total_vat || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">💵 Nakit:</span>
                      <span>₺{parseFloat(report.cash_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💳 Kredi Kartı:</span>
                      <span>₺{parseFloat(report.credit_card_amount || 0).toFixed(2)}</span>
                    </div>
                    {report.fiscal_number && (
                      <div className="text-xs text-gray-500 mt-2">
                        Mali No: {report.fiscal_number}
                      </div>
                    )}
                  </div>

                  {report.image_path && (
                    <img
                      src={`${API_URL}/${report.image_path}`}
                      alt="Z Raporu"
                      className="w-full h-40 object-cover rounded mt-3 cursor-pointer"
                      onClick={() => window.open(`${API_URL}/${report.image_path}`, '_blank')}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;