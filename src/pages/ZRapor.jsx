import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ZRapor() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/zrapor/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu Z raporunu silmek istediğinize emin misiniz?')) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/api/zrapor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Z Raporu silindi!');
      loadReports();
    } catch (error) {
      alert('❌ Silme hatası: ' + error.message);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '20px', textAlign: 'center' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>📊 Z Raporları</h1>

        {reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <p>Henüz Z raporu yüklemediniz</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--primary)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white' }}>Tarih</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white' }}>Z No</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'white' }}>Nakit</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'white' }}>Kart</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'white' }}>Toplam</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'white' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.id} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '12px' }}>{report.rapor_tarihi}</td>
                    <td style={{ padding: '12px' }}>{report.rapor_no}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(report.nakit_satis).toFixed(2)} ₺</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(report.kart_satis).toFixed(2)} ₺</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>{parseFloat(report.toplam_satis).toFixed(2)} ₺</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(report.id)} style={{ padding: '6px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZRapor;