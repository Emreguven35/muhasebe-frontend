import React, { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression'; 

function Upload() {
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
      formData.append('receipt', selectedFile);
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/api/ocr/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        const parsedData = response.data.parsedData;
        setResult(parsedData);
        
        const totalAmount = parseFloat(parsedData.toplamTutar || 0);
        const hasRequiredFields = parsedData.firmaUnvani && parsedData.tarih;
        
        if (totalAmount === 0 || !parsedData.toplamTutar) {
          alert('⚠️ UYARI: Toplam tutar okunamadı!\n\nFiş kaydedildi ancak "Fişlerim" bölümünden manuel olarak düzenlemeniz gerekiyor.');
        } else if (!hasRequiredFields) {
          alert('⚠️ UYARI: Bazı bilgiler eksik okunamadı!\n\nFiş kaydedildi, lütfen "Fişlerim" bölümünden kontrol edin.');
        } else {
          alert('✅ Fiş başarıyla yüklendi ve kaydedildi!');
        }
        
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
        📸 Fiş Yükle
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
              border: '2px dashed var(--gray-200)',
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '64px', marginBottom: '16px' }}>📷</span>
            <p style={{ fontSize: '18px', color: 'var(--gray-800)', marginBottom: '8px' }}>
              Fotoğraf Çek veya Seç
            </p>
            <p style={{ fontSize: '14px', color: 'var(--gray-800)', marginBottom: '16px' }}>
              Fişi net bir şekilde çekin
            </p>

            {/* FOTOĞRAF ÇEKME İPUÇLARI */}
            <div style={{ 
              marginTop: '16px',
              padding: '16px',
              background: '#fff3e0',
              borderRadius: '12px',
              textAlign: 'left',
              width: '100%',
              maxWidth: '400px'
            }}>
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '700', 
                marginBottom: '12px', 
                color: '#e65100',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                Daha İyi Okuma İçin İpuçları:
              </p>
              <ul style={{ 
                fontSize: '12px', 
                color: '#e65100',
                marginLeft: '20px',
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>Fişi düz bir yüzeye koyun</li>
                <li>İyi ışıklı ortamda çekin</li>
                <li>Fişin tamamı karede olsun</li>
                <li>Buruşuk fişleri düzeltin</li>
                <li>Gölge düşmesin</li>
                <li>Flaş kullanmayın (parlamayı önler)</li>
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
            Fiş okunuyor ve kaydediliyor...
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: 'var(--success)' }}>
            ✅ Fiş Kaydedildi!
          </h3>
          
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p><strong>Firma:</strong> {result.firmaUnvani || '-'}</p>
            <p><strong>Tarih:</strong> {result.tarih || '-'}</p>
            <p><strong>Fiş No:</strong> {result.fisNo || '-'}</p>
            <p><strong>Gider Cinsi:</strong> {result.giderCinsi || '-'}</p>
            <p><strong>Toplam:</strong> {result.toplamTutar || '0.00'} ₺</p>
            <p><strong>KDV:</strong> {result.kdv20 || '0.00'} ₺</p>
          </div>

          {(!result.toplamTutar || parseFloat(result.toplamTutar) === 0) && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#fff3e0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#e65100'
            }}>
              ⚠️ Bazı bilgiler eksik! "Fişlerim" bölümünden düzenleyebilirsiniz.
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="btn btn-primary btn-large"
            style={{ marginTop: '16px' }}
          >
            ➕ Yeni Fiş Yükle
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;