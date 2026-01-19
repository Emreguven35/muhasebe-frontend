import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const handleLogout = useCallback(() => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const loadUserInfo = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUserInfo(JSON.parse(userData));
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadUserInfo();
    
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [loadUserInfo]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('Uygulama zaten yüklü veya tarayıcınız desteklemiyor');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      alert('✅ Uygulama ana ekrana ekleniyor!');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ marginTop: '40px' }}>Yükleniyor...</p>
      </div>
    );
  }



  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>
        👤 Profil
      </h1>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            🧑‍💼
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#1f2937' }}>
            {userInfo?.name || 'Kullanıcı'}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '14px' }}>
            {userInfo?.email || '-'}
          </p>
        </div>

        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4b5563' }}>Kullanıcı ID:</span>
            <strong>#{userInfo?.id || '-'}</strong>
          </div>
        </div>
      </div>

      {showInstallButton && (
        <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>📱</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'white' }}>
                Uygulamayı Yükle
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>
                Ana ekrana ekle, daha hızlı erişim!
              </p>
              <button
                onClick={handleInstallApp}
                className="btn"
                style={{ 
                  background: 'white',
                  color: '#3b82f6',
                  padding: '8px 16px',
                  fontSize: '14px'
                }}
              >
                📲 Yükle
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1f2937' }}>
          📱 Uygulama
        </h3>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4b5563' }}>Versiyon:</span>
            <strong>1.0.0</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4b5563' }}>PWA Durumu:</span>
            <span style={{ 
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              background: '#e8f5e9',
              color: '#2e7d32'
            }}>
              ✅ Aktif
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1f2937' }}>
          ℹ️ Hakkında
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563' }}>
          Muhasebe OCR, fiş fotoğraflarınızı yükleyip OCR ile otomatik okuyarak Excel'e aktarmanızı sağlar.
        </p>
        
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#4b5563'
        }}>
          <p><strong>Özellikler:</strong></p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>📸 Fotoğraf yükleme ve sıkıştırma</li>
            <li>🔍 Google Vision OCR</li>
            <li>📊 Excel export</li>
            <li>💾 Veritabanı kaydı</li>
            <li>🔐 Kullanıcı authentication</li>
            <li>📱 PWA desteği</li>
            <li>📑 Z Raporu desteği</li>
          </ul>
        </div>
      </div>

      <button 
        className="btn btn-large"
        style={{ 
          marginTop: '20px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          padding: '14px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          width: '100%'
        }}
        onClick={handleLogout}
      >
        🚪 Çıkış Yap
      </button>
    </div>
  );
}

export default Profile;