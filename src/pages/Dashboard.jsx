import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    totalKdv: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/ocr/receipts`, {
  headers: { Authorization: `Bearer ${token}` }
});
      if (response.data.success) {
        const receipts = response.data.receipts;
        const totalAmount = receipts.reduce((sum, r) => sum + (parseFloat(r.toplam_tutar) || 0), 0);
        const totalKdv = receipts.reduce((sum, r) => sum + (parseFloat(r.kdv20) || 0), 0);
        
        setStats({
          totalReceipts: receipts.length,
          totalAmount: totalAmount,
          totalKdv: totalKdv
        });
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
       const response = await axios.get(`${API_URL}/api/ocr/receipts`, {
      headers: { Authorization: `Bearer ${token}` }  // ← EKLE
    });
      
      if (!response.data.success || response.data.receipts.length === 0) {
        alert('Excel\'e aktarılacak fiş bulunamadı!');
        return;
      }

      const formattedReceipts = response.data.receipts.map(r => ({
        firmaUnvani: r.firma_unvani,
        tarih: r.tarih,
        fisNo: r.fis_no,
        giderCinsi: r.gider_cinsi,
        toplamTutar: r.toplam_tutar,
        kdv1: r.kdv1,
        kdv10: r.kdv10,
        kdv20: r.kdv20
      }));

      const excelResponse = await axios.post(
        'http://localhost:5001/api/ocr/export-excel',
        { receipts: formattedReceipts },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([excelResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'harcamalar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('✅ Excel başarıyla indirildi!');
    } catch (error) {
      alert('❌ Excel indirme hatası: ' + error.message);
    }
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
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--gray-900)' }}>
        👋 Hoş Geldiniz!
      </h1>

      <div className="grid grid-2">
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px' }}>
            {stats.totalReceipts}
          </h3>
          <p style={{ color: 'var(--gray-800)' }}>Toplam Fiş</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', color: 'var(--success)', marginBottom: '8px' }}>
            {stats.totalAmount.toFixed(2)} ₺
          </h3>
          <p style={{ color: 'var(--gray-800)' }}>Toplam Tutar</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px' }}>
            {stats.totalKdv.toFixed(2)} ₺
          </h3>
          <p style={{ color: 'var(--gray-800)' }}>Toplam KDV</p>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--gray-900)' }}>
          Hızlı İşlemler
        </h2>
        
        <button 
          className="btn btn-primary btn-large" 
          style={{ marginBottom: '12px' }}
          onClick={() => navigate('/upload')}
        >
          📸 Fiş Yükle
        </button>
        
        {stats.totalReceipts > 0 && (
          <button 
            className="btn btn-success btn-large"
            onClick={exportToExcel}
          >
            📥 Excel İndir ({stats.totalReceipts} Fiş)
          </button>
        )}

        {stats.totalReceipts === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
            <p style={{ color: 'var(--gray-800)' }}>
              Henüz fiş yüklemediniz. Başlamak için yukarıdaki butona tıklayın! 👆
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;