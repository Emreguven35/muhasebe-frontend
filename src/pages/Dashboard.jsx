import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import React, { useState, useEffect, useCallback } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('receipts');
  const [receipts, setReceipts] = useState([]);
  const [zReports, setZReports] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    thisMonthReceipts: 0,
    thisMonthAmount: 0
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  

  const loadData = useCallback(async () => {
  try {
    await Promise.all([
      fetchReceipts(),
      fetchZReports(),
      fetchStats()
    ]);
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadData();
  } else {
    navigate('/login');
  }
}, [navigate, loadData]);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/api/receipts');
      setReceipts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fişler yüklenirken hata:', error);
      setReceipts([]);
    }
  };

  const fetchZReports = async () => {
    try {
      const response = await api.get('/api/z-reports');
      setZReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Z Raporları yüklenirken hata:', error);
      setZReports([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/receipts/stats');
      setStats(response.data);
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

    try {
      const endpoint = activeTab === 'zreports' 
        ? '/api/z-reports/upload'
        : '/api/receipts/upload';
        
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert(activeTab === 'zreports' ? '✅ Z Raporu başarıyla yüklendi!' : '✅ Fiş başarıyla yüklendi!');
        loadData();
      } else {
        alert('❌ Yükleme başarısız: ' + (response.data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Upload hatası:', error);
      alert('❌ Yükleme hatası: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu fişi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await api.delete(`/api/receipts/${id}`);

      if (response.data.success) {
        loadData();
        alert('✅ Fiş silindi!');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('❌ Fiş silinemedi!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #e5e7eb', 
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            📋 Muhasebe Fiş Takip
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#6b7280' }}>Merhaba, {user?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Toplam Fiş</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.totalReceipts || 0}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Toplam Tutar</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              ₺{parseFloat(stats.totalAmount || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Bu Ay Fiş</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {stats.thisMonthReceipts || 0}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Bu Ay Tutar</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              ₺{parseFloat(stats.thisMonthAmount || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', background: 'white', borderRadius: '12px 12px 0 0', padding: '0 16px' }}>
          <button
            onClick={() => setActiveTab('receipts')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'receipts' ? '2px solid #3b82f6' : 'none',
              color: activeTab === 'receipts' ? '#3b82f6' : '#6b7280',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Fişler ({receipts.length})
          </button>
          <button
            onClick={() => setActiveTab('zreports')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'zreports' ? '2px solid #3b82f6' : 'none',
              color: activeTab === 'zreports' ? '#3b82f6' : '#6b7280',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Z Raporları ({zReports.length})
          </button>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'inline-block',
            fontWeight: '600',
            opacity: uploading ? 0.6 : 1
          }}>
            {uploading ? '⏳ Yükleniyor...' : `📸 ${activeTab === 'zreports' ? 'Z Raporu' : 'Fiş'} Yükle`}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Content */}
        {activeTab === 'receipts' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {receipts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                <p style={{ color: '#6b7280' }}>Henüz fiş yüklemediniz.</p>
              </div>
            ) : (
              receipts.map((receipt) => (
                <div key={receipt.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px', transition: 'box-shadow 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>
                        {receipt.company_name || 'Firma Adı Yok'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {receipt.date ? new Date(receipt.date).toLocaleDateString('tr-TR') : '-'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                    >
                      🗑️
                    </button>
                  </div>

                  {receipt.category && (
                    <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', marginBottom: '12px' }}>
                      {receipt.category}
                    </div>
                  )}

                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Toplam:</span>
                      <span style={{ fontWeight: '600' }}>₺{parseFloat(receipt.total || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>KDV:</span>
                      <span style={{ color: '#8b5cf6', fontWeight: '600' }}>₺{parseFloat(receipt.vat || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {receipt.image_path && (
                    <img
                      src={`http://localhost:5001/${receipt.image_path}`}
                      alt="Fiş"
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', cursor: 'pointer' }}
                      onClick={() => window.open(`http://localhost:5001/${receipt.image_path}`, '_blank')}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {zReports.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                <p style={{ color: '#6b7280' }}>Henüz Z Raporu yüklemediniz.</p>
              </div>
            ) : (
              zReports.map((report) => (
                <div key={report.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>Z Raporu</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {report.report_date ? new Date(report.report_date).toLocaleDateString('tr-TR') : '-'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Fiş Sayısı</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>{report.receipt_count || 0}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Toplam Satış:</span>
                      <span style={{ fontWeight: '600' }}>₺{parseFloat(report.total_sales || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>KDV:</span>
                      <span style={{ color: '#8b5cf6', fontWeight: '600' }}>₺{parseFloat(report.total_vat || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                      <span style={{ color: '#6b7280' }}>💵 Nakit:</span>
                      <span>₺{parseFloat(report.cash_amount || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>💳 Kart:</span>
                      <span>₺{parseFloat(report.credit_card_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {report.image_path && (
                    <img
                      src={`http://localhost:5001/${report.image_path}`}
                      alt="Z Raporu"
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', cursor: 'pointer' }}
                      onClick={() => window.open(`http://localhost:5001/${report.image_path}`, '_blank')}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;