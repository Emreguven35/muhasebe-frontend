// src/pages/ZRaporUpload.jsx
import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';

function ZRaporUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>
        📊 Z Raporu Yükle
      </h1>

      {!preview && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="fileInput"
          />
          
          <label
            htmlFor="fileInput"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '40px',
              border: '2px dashed #e5e7eb',
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '64px', marginBottom: '16px' }}>📊</span>
            <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '8px' }}>
              Z Raporu Fotoğrafı Çek veya Seç
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Z raporunu net bir şekilde çekin
            </p>

            <div style={{ 
              marginTop: '16px',
              padding: '16px',
              background: '#e3f2fd',
              borderRadius: '12px',
              textAlign: 'left',
              width: '100%',
              maxWidth: '400px'
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
                marginLeft: '20px',
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
          </label>
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