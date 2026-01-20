// src/pages/ZRaporUpload.jsx
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';

function ZRaporUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Ayrı input referansları
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log('📸 Orijinal boyut:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        
        const compressedBlob = await imageCompression(file, options);
        console.log('✅ Sıkıştırılmış boyut:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB');
        
        const compressedFile = new File(
          [compressedBlob], 
          file.name, 
          { type: 'image/jpeg' }
        );
        
        setSelectedFile(compressedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(compressedFile);
        
      } catch (error) {
        console.error('Sıkıştırma hatası:', error);
        alert('Fotoğraf işlenemedi!');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Lütfen bir fotoğraf seçin!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await api.post('/api/z-reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const report = response.data.zReport;
        setResult({
          tarih: report.report_date,
          raporNo: report.fiscal_number,
          toplamSatis: report.total_sales,
          toplamKdv: report.total_vat,
          nakitSatis: report.cash_amount,
          posSatis: report.credit_card_amount,
          fisNo: report.receipt_count
        });
        
        alert('✅ Z Raporu başarıyla yüklendi ve kaydedildi!');
        
        setSelectedFile(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Yükleme hatası: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  // Kamera açma
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Galeri açma
  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>
        📊 Z Raporu Yükle
      </h1>

      {/* Gizli input'lar */}
      {/* Kamera için input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        ref={cameraInputRef}
        style={{ display: 'none' }}
      />
      
      {/* Galeri için input (capture yok) */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={galleryInputRef}
        style={{ display: 'none' }}
      />

      {!preview && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '64px' }}>📊</span>
            <p style={{ fontSize: '18px', color: '#4b5563', marginTop: '16px', marginBottom: '8px' }}>
              Z Raporu Fotoğrafı Ekle
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Z raporunu net bir şekilde çekin veya galeriden seçin
            </p>
          </div>

          {/* Butonlar */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            maxWidth: '300px',
            margin: '0 auto 24px'
          }}>
            {/* Fotoğraf Çek Butonu */}
            <button
              onClick={openCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <span style={{ fontSize: '24px' }}>📷</span>
              Fotoğraf Çek
            </button>

            {/* Galeriden Seç Butonu */}
            <button
              onClick={openGallery}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <span style={{ fontSize: '24px' }}>🖼️</span>
              Galeriden Seç
            </button>
          </div>

          {/* İpuçları */}
          <div style={{ 
            padding: '16px',
            background: '#e3f2fd',
            borderRadius: '12px',
            textAlign: 'left',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <p style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              marginBottom: '12px', 
              color: '#1565c0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              Z Raporu İpuçları:
            </p>
            <ul style={{ 
              fontSize: '12px', 
              color: '#1565c0',
              lineHeight: '1.8',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>Raporun tamamını çekin</li>
              <li>Satır ve rakamlar net görünsün</li>
              <li>İyi ışıklı ortamda çekin</li>
              <li>Z No ve tarihi içersin</li>
            </ul>
          </div>
        </div>
      )}

      {preview && !loading && (
        <div className="card">
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              borderRadius: '12px',
              marginBottom: '16px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleUpload}
              style={{
                flex: 1,
                padding: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✅ Yükle ve Kaydet
            </button>
            
            <button
              onClick={handleReset}
              style={{ 
                flex: 1,
                padding: '12px',
                background: '#e5e7eb',
                color: '#4b5563',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Yeniden Çek
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>
            OCR işleniyor...
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
            Z Raporu okunuyor ve kaydediliyor...
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#10b981' }}>
            ✅ Z Raporu Kaydedildi!
          </h3>
          
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p><strong>Tarih:</strong> {result.tarih || '-'}</p>
            <p><strong>Fiş Sayısı:</strong> {result.fisNo || '-'}</p>
            <p><strong>Mali No:</strong> {result.raporNo || '-'}</p>
            <p><strong>Toplam Satış:</strong> {parseFloat(result.toplamSatis || 0).toFixed(2)} ₺</p>
            <p><strong>Toplam KDV:</strong> {parseFloat(result.toplamKdv || 0).toFixed(2)} ₺</p>
            <hr style={{ margin: '12px 0', border: '1px solid #e5e7eb' }} />
            <p><strong>💵 Nakit:</strong> {parseFloat(result.nakitSatis || 0).toFixed(2)} ₺</p>
            <p><strong>💳 POS:</strong> {parseFloat(result.posSatis || 0).toFixed(2)} ₺</p>
          </div>
          
          <button
            onClick={handleReset}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '14px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Yeni Z Raporu Yükle
          </button>
        </div>
      )}
    </div>
  );
}

export default ZRaporUpload;