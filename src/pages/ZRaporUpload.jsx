import React, { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const formData = new FormData();
      formData.append('image', selectedFile);
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/api/zrapor/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        const parsedData = response.data.data;
        setResult(parsedData);
        
        alert('✅ Z Raporu başarıyla yüklendi ve kaydedildi!');
        
        setSelectedFile(null);
        setPreview(null);
      }
    } catch (error) {
      alert('❌ Yükleme hatası: ' + error.message);
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
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--gray-900)' }}>
        📊 Z Raporu Yükle
      </h1>

      {!preview && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <input
            type="file"
            accept="image/*"
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
              border: '2px dashed var(--gray-200)',
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '64px', marginBottom: '16px' }}>📊</span>
            <p style={{ fontSize: '18px', color: 'var(--gray-800)', marginBottom: '8px' }}>
              Z Raporu Fotoğrafı Çek veya Seç
            </p>
            <p style={{ fontSize: '14px', color: 'var(--gray-800)', marginBottom: '16px' }}>
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
              className="btn btn-success"
              style={{ flex: 1 }}
            >
              ✅ Yükle ve Kaydet
            </button>
            
            <button
              onClick={handleReset}
              className="btn"
              style={{ 
                flex: 1,
                background: 'var(--gray-200)',
                color: 'var(--gray-800)'
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
          <p style={{ fontSize: '18px', color: 'var(--gray-800)' }}>
            OCR işleniyor...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--gray-800)', marginTop: '8px' }}>
            Z Raporu okunuyor ve kaydediliyor...
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: 'var(--success)' }}>
            ✅ Z Raporu Kaydedildi!
          </h3>
          
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p><strong>Tarih:</strong> {result.tarih || '-'}</p>
            <p><strong>Fiş No:</strong> {result.fisNo || '-'}</p>
            <p><strong>Rapor No:</strong> {result.raporNo || '-'}</p>
            <p><strong>Toplam Satış:</strong> {result.toplamSatis} ₺</p>
            <p><strong>Toplam KDV:</strong> {result.toplamKdv} ₺</p>
            <p><strong>Matrah:</strong> {result.matrah} ₺</p>
            <hr style={{ margin: '12px 0', border: '1px solid var(--gray-200)' }} />
            <p><strong>Nakit:</strong> {result.nakitSatis} ₺</p>
            <p><strong>POS:</strong> {result.posSatis} ₺</p>
            <p><strong>Kredili:</strong> {result.krediliSatis} ₺</p>
            <hr style={{ margin: '12px 0', border: '1px solid var(--gray-200)' }} />
            {parseFloat(result.kdv1) > 0 && <p><strong>KDV %1:</strong> {result.kdv1} ₺</p>}
            {parseFloat(result.kdv10) > 0 && <p><strong>KDV %10:</strong> {result.kdv10} ₺</p>}
            {parseFloat(result.kdv20) > 0 && <p><strong>KDV %20:</strong> {result.kdv20} ₺</p>}
          </div>
          
          <button
            onClick={handleReset}
            className="btn btn-primary btn-large"
            style={{ marginTop: '16px' }}
          >
            ➕ Yeni Z Raporu Yükle
          </button>
        </div>
      )}
    </div>
  );
}

export default ZRaporUpload;