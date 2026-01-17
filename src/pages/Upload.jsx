import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('receipt');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert('❌ Lütfen bir fotoğraf seçin!');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // Endpoint'i uploadType'a göre belirle
      const endpoint = uploadType === 'receipt' 
        ? `${API_URL}/api/ocr/upload`
        : `${API_URL}/api/zrapor/upload`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert(`✅ ${uploadType === 'receipt' ? 'Fiş' : 'Z Raporu'} başarıyla yüklendi!`);
        setSelectedImage(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('❌ Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>📸 Fiş Yükle</h1>

      <div className="card">
        {/* Upload Type Seçici */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Yükleme Tipi:
          </label>
          <select 
            value={uploadType} 
            onChange={(e) => setUploadType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid var(--gray-200)',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
          >
            <option value="receipt">📄 Fiş</option>
            <option value="zrapor">📊 Z Raporu</option>
          </select>
        </div>

        {/* Fotoğraf Input */}
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="imageUpload" 
            className="btn btn-primary" 
            style={{ 
              width: '100%',
              display: 'block',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            📸 Fotoğraf Seç
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: '20px' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
          </div>
        )}

        {/* Yükle Butonu */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedImage}
          className="btn btn-success"
          style={{ 
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            opacity: (loading || !selectedImage) ? 0.5 : 1
          }}
        >
          {loading ? '⏳ Yükleniyor...' : `🚀 ${uploadType === 'receipt' ? 'Fişi' : 'Z Raporunu'} Yükle`}
        </button>
      </div>
    </div>
  );
}

export default Upload;