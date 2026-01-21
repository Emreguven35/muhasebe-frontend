import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import React, { useState, useEffect, useCallback } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    thisMonthReceipts: 0,
    thisMonthAmount: 0
  });
  const [loading, setLoading] = useState(true);

  // Para formatı - Türk formatı (1.234,56)
  const formatMoney = (amount) => {
    const num = parseFloat(amount || 0);
    return num.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchReceipts(),
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
      const data = Array.isArray(response.data) ? response.data : [];
      // Tarihe göre sırala - en yeni en üstte
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);
        return dateB - dateA;
      });
      setReceipts(sorted);
    } catch (error) {
      console.error('Fişler yüklenirken hata:', error);
      setReceipts([]);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            border: '4px solid rgba(255,255,255,0.3)', 
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: 'white', fontSize: '16px' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '100px' }}>
      {/* Header - Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 20px 80px',
        borderRadius: '0 0 32px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>Hoş geldin,</p>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '4px 0 0' }}>
              {user?.name || 'Kullanıcı'} 👋
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* İstatistik Kartları - Floating */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '-60px auto 0', 
        padding: '0 16px'
      }}>
        {/* Ana Kart - Toplam */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💰
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Toplam Harcama</p>
                <p style={{ color: '#111827', fontSize: '28px', fontWeight: '700', margin: '2px 0 0' }}>
                  {formatMoney(stats.totalAmount)} ₺
                </p>
              </div>
            </div>
            <div style={{ 
              background: '#ecfdf5', 
              color: '#059669', 
              padding: '6px 12px', 
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {stats.totalReceipts || 0} Fiş
            </div>
          </div>

          {/* Ayırıcı */}
          <div style={{ height: '1px', background: '#e5e7eb', margin: '16px 0' }}></div>

          {/* Bu Ay */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                📅
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Bu Ay</p>
                <p style={{ color: '#111827', fontSize: '20px', fontWeight: '700', margin: '2px 0 0' }}>
                  {formatMoney(stats.thisMonthAmount)} ₺
                </p>
              </div>
            </div>
            <div style={{ 
              background: '#fef3c7', 
              color: '#d97706', 
              padding: '6px 12px', 
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {stats.thisMonthReceipts || 0} Fiş
            </div>
          </div>
        </div>

        {/* Hızlı Erişim Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div 
            onClick={() => navigate('/upload')}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <p style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: 0 }}>Fiş Yükle</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '4px 0 0' }}>Yeni fiş ekle</p>
          </div>

          <div 
            onClick={() => navigate('/z-rapor-upload')}
            style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <p style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: 0 }}>Z Raporu</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '4px 0 0' }}>Rapor yükle</p>
          </div>
        </div>

        {/* Son Fişler */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Son Fişler
            </h2>
            <button 
              onClick={() => navigate('/receipts')}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#3b82f6', 
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Tümünü Gör →
            </button>
          </div>

          {receipts.length === 0 ? (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '40px 20px', 
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ color: '#6b7280', margin: 0 }}>Henüz fiş eklenmedi</p>
              <button 
                onClick={() => navigate('/upload')}
                style={{
                  marginTop: '16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                İlk Fişini Ekle
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {receipts.slice(0, 5).map((receipt) => {
                return (
                  <div 
                    key={receipt.id} 
                    style={{ 
                      background: 'white', 
                      borderRadius: '16px', 
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}
                  >
                    {/* Fiş İkonu */}
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: '#f0fdf4',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0
                    }}>
                      🧾
                    </div>

                    {/* Bilgiler */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: '#111827', 
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {receipt.company_name || 'Firma Adı Yok'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                        {receipt.date ? new Date(receipt.date).toLocaleDateString('tr-TR') : '-'}
                      </p>
                    </div>

                    {/* Tutar */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        {formatMoney(receipt.total)} ₺
                      </p>
                      <p style={{ fontSize: '12px', color: '#8b5cf6', margin: '2px 0 0' }}>
                        KDV: {formatMoney(receipt.vat)} ₺
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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