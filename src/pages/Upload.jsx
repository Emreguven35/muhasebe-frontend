// src/pages/Upload.jsx
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';

function Upload() {
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

      const response = await api.post('/api/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const receipt = response.data.receipt;
        setResult({
          firmaUnvani: receipt.company_name,
          tarih: receipt.date,
          fisNo: receipt.receipt_number,
          giderCinsi: receipt.category,
          toplamTutar: receipt.total,
          kdv1: receipt.vat1,
          kdv10: receipt.vat10,
          kdv20: receipt.vat20
        });
        
        const totalAmount = parseFloat(receipt.total || 0);
        const hasRequiredFields = receipt.company_name && receipt.date;
        
        if (totalAmount === 0 || !receipt.total) {
          alert('⚠️ UYARI: Toplam tutar okunamadı!\n\nFiş kaydedildi ancak "Fişlerim" bölümünden manuel olarak kontrol edin.');
        } else if (!hasRequiredFields) {
          alert('⚠️ UYARI: Bazı bilgiler eksik okunamadı!\n\nFiş kaydedildi, lütfen "Fişlerim" bölümünden kontrol edin.');
        } else {
          alert('✅ Fiş başarıyla yüklendi ve kaydedildi!');
        }
        
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
        📸 Fiş Yükle
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
            <span style={{ fontSize: '64px' }}>📷</span>
            <p style={{ fontSize: '18px', color: '#4b5563', marginTop: '16px', marginBottom: '8px' }}>
              Fiş Fotoğrafı Ekle
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Fişi net bir şekilde çekin veya galeriden seçin
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
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
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
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
            background: '#fff3e0',
            borderRadius: '12px',
            textAlign: 'left',
            maxWidth: '400px',
            margin: '0 auto'
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
            Fiş okunuyor ve kaydediliyor...
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#10b981' }}>
            ✅ Fiş Kaydedildi!
          </h3>
          
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p><strong>Firma:</strong> {result.firmaUnvani || '-'}</p>
            <p><strong>Tarih:</strong> {result.tarih || '-'}</p>
            <p><strong>Fiş No:</strong> {result.fisNo || '-'}</p>
            <p><strong>Kategori:</strong> {result.giderCinsi || '-'}</p>
            <p><strong>Toplam:</strong> {result.toplamTutar || '0.00'} ₺</p>
            
            {/* KDV'ler ayrı ayrı */}
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: '#f0fdf4', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '8px', color: '#166534' }}>📊 KDV Detayları:</p>
              <p><strong>KDV %1:</strong> {parseFloat(result.kdv1 || 0).toFixed(2)} ₺</p>
              <p><strong>KDV %10:</strong> {parseFloat(result.kdv10 || 0).toFixed(2)} ₺</p>
              <p><strong>KDV %20:</strong> {parseFloat(result.kdv20 || 0).toFixed(2)} ₺</p>
              <p style={{ marginTop: '8px', fontWeight: '600', color: '#166534' }}>
                <strong>Toplam KDV:</strong> {(parseFloat(result.kdv1 || 0) + parseFloat(result.kdv10 || 0) + parseFloat(result.kdv20 || 0)).toFixed(2)} ₺
              </p>
            </div>
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
            ➕ Yeni Fiş Yükle
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;