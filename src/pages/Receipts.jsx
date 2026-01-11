import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token'); 
      const response = await axios.get(`${API_URL}/api/ocr/receipts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReceipts(response.data.receipts);
      }
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (receipt) => {
    setEditingId(receipt.id);
    setEditForm({
      firma_unvani: receipt.firma_unvani || '',
      tarih: receipt.tarih || '',
      fis_no: receipt.fis_no || '',
      gider_cinsi: receipt.gider_cinsi || '',
      toplam_tutar: receipt.toplam_tutar || '',
      kdv20: receipt.kdv20 || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (receiptId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      await axios.put(
      `${API_URL}/api/ocr/receipts/${receiptId}`, // ← DEĞİŞTİR
      editForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

      alert('✅ Fiş güncellendi!');
      setEditingId(null);
      loadReceipts();
    } catch (error) {
      alert('❌ Güncelleme hatası: ' + error.message);
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm('Bu fişi silmek istediğinize emin misiniz?')) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      await axios.delete(
      `${API_URL}/api/ocr/receipts/${receiptId}`, // ← DEĞİŞTİR
      { headers: { Authorization: `Bearer ${token}` } }
    );

      alert('✅ Fiş silindi!');
      loadReceipts();
    } catch (error) {
      alert('❌ Silme hatası: ' + error.message);
    }
  };

  const exportToExcel = async () => {
    try {
      if (receipts.length === 0) {
        alert('Fiş bulunamadı!');
        return;
      }

      const formattedReceipts = receipts.map(r => ({
        firmaUnvani: r.firma_unvani,
        tarih: r.tarih,
        fisNo: r.fis_no,
        giderCinsi: r.gider_cinsi,
        toplamTutar: r.toplam_tutar,
        kdv1: r.kdv1,
        kdv10: r.kdv10,
        kdv20: r.kdv20
      }));
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 
      const token = localStorage.getItem('token');
      const response = await axios.post(
      `${API_URL}/api/ocr/export-excel`, // ← DEĞİŞTİR
      { receipts: formattedReceipts },
      { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'harcamalar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('✅ Excel indirildi!');
    } catch (error) {
      alert('❌ Hata: ' + error.message);
    }
  };

  const totals = {
    count: receipts.length,
    totalAmount: receipts.reduce((sum, r) => sum + (parseFloat(r.toplam_tutar) || 0), 0),
    kdv20: receipts.reduce((sum, r) => sum + (parseFloat(r.kdv20) || 0), 0)
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ marginTop: '40px' }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      paddingTop: '20px', 
      paddingBottom: '80px',
      background: 'var(--gray-50)',
      minHeight: '100vh'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>📋 Fişlerim</h1>
          
          {receipts.length > 0 && (
            <button 
              onClick={exportToExcel}
              className="btn btn-success"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              📥 Excel İndir
            </button>
          )}
        </div>

        {receipts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px', color: 'var(--gray-800)' }}>
              Henüz fiş yüklemediniz
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '900px'
                }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)' }}>
                      <th style={headerStyle}>Tarih</th>
                      <th style={headerStyle}>Fatura No</th>
                      <th style={headerStyle}>Firma</th>
                      <th style={headerStyle}>Gider Cinsi</th>
                      <th style={headerStyle}>Toplam</th>
                      <th style={headerStyle}>KDV %20</th>
                      <th style={{...headerStyle, textAlign: 'center'}}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt, index) => (
                      editingId === receipt.id ? (
                        <tr key={receipt.id} style={{ background: '#fffbf0' }}>
                          <td style={cellStyle}>
                            <input
                              type="text"
                              placeholder="GG/AA/YYYY"
                              value={editForm.tarih}
                              onChange={(e) => setEditForm({...editForm, tarih: e.target.value})}
                              style={inputStyle}
                            />
                          </td>
                          <td style={cellStyle}>
                            <input
                              type="text"
                              value={editForm.fis_no}
                              onChange={(e) => setEditForm({...editForm, fis_no: e.target.value})}
                              style={inputStyle}
                            />
                          </td>
                          <td style={cellStyle}>
                            <input
                              type="text"
                              value={editForm.firma_unvani}
                              onChange={(e) => setEditForm({...editForm, firma_unvani: e.target.value})}
                              style={inputStyle}
                            />
                          </td>
                          <td style={cellStyle}>
                            <select
                              value={editForm.gider_cinsi}
                              onChange={(e) => setEditForm({...editForm, gider_cinsi: e.target.value})}
                              style={inputStyle}
                            >
                              <option value="OTOPARK">OTOPARK</option>
                              <option value="MARKET">MARKET</option>
                              <option value="YİYECEK">YİYECEK</option>
                              <option value="YAKIT">YAKIT</option>
                              <option value="ULAŞIM">ULAŞIM</option>
                              <option value="DİĞER">DİĞER</option>
                            </select>
                          </td>
                          <td style={cellStyle}>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.toplam_tutar}
                              onChange={(e) => setEditForm({...editForm, toplam_tutar: e.target.value})}
                              style={inputStyle}
                            />
                          </td>
                          <td style={cellStyle}>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.kdv20}
                              onChange={(e) => setEditForm({...editForm, kdv20: e.target.value})}
                              style={inputStyle}
                            />
                          </td>
                          <td style={{...cellStyle, textAlign: 'center'}}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleSave(receipt.id)}
                                style={saveButtonStyle}
                              >
                                ✅
                              </button>
                              <button
                                onClick={handleCancel}
                                style={cancelButtonStyle}
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr 
                          key={receipt.id}
                          style={{ 
                            background: index % 2 === 0 ? 'white' : '#f9fafb',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb'}
                        >
                          <td style={cellStyle}>{receipt.tarih || '-'}</td>
                          <td style={cellStyle}>{receipt.fis_no || '-'}</td>
                          <td style={cellStyle}>{receipt.firma_unvani || '-'}</td>
                          <td style={cellStyle}>
                            <span style={{
                              background: getGiderColor(receipt.gider_cinsi),
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {receipt.gider_cinsi || 'Diğer'}
                            </span>
                          </td>
                          <td style={{...cellStyle, textAlign: 'right', fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace'}}>
                            {parseFloat(receipt.toplam_tutar || 0).toFixed(2)} ₺
                          </td>
                          <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                            {parseFloat(receipt.kdv20 || 0).toFixed(2)}
                          </td>
                          <td style={{...cellStyle, textAlign: 'center'}}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEdit(receipt)}
                                style={editButtonStyle}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(receipt.id)}
                                style={deleteButtonStyle}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    
                    <tr style={{ 
                      background: '#f3f4f6',
                      fontWeight: '700',
                      borderTop: '2px solid var(--primary)'
                    }}>
                      <td style={{...cellStyle, fontWeight: '700'}} colSpan="4">
                        TOPLAM ({totals.count} Fiş)
                      </td>
                      <td style={{...cellStyle, textAlign: 'right', fontSize: '16px', color: 'var(--success)', fontFamily: 'monospace'}}>
                        {totals.totalAmount.toFixed(2)} ₺
                      </td>
                      <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)'}}>
                        {totals.kdv20.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p style={{ 
              textAlign: 'center', 
              marginTop: '16px', 
              fontSize: '12px', 
              color: 'var(--gray-800)' 
            }}>
              💡 Tabloyu kaydırarak tüm kolonları görebilirsiniz
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const headerStyle = {
  padding: '16px 12px',
  textAlign: 'left',
  color: 'white',
  fontWeight: '600',
  fontSize: '14px',
  borderBottom: '2px solid rgba(255,255,255,0.2)'
};

const cellStyle = {
  padding: '12px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
  color: 'var(--gray-900)'
};

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '2px solid var(--primary)',
  borderRadius: '6px',
  fontSize: '13px',
  outline: 'none'
};

const editButtonStyle = {
  padding: '6px 12px',
  background: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const deleteButtonStyle = {
  padding: '6px 12px',
  background: 'var(--danger)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const saveButtonStyle = {
  padding: '6px 12px',
  background: 'var(--success)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const cancelButtonStyle = {
  padding: '6px 12px',
  background: 'var(--gray-200)',
  color: 'var(--gray-800)',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const getGiderColor = (cinsi) => {
  const colors = {
    'OTOPARK': '#e3f2fd',
    'MARKET': '#f3e5f5',
    'YİYECEK': '#fff3e0',
    'YAKIT': '#ffebee',
    'ULAŞIM': '#e8f5e9'
  };
  return colors[cinsi] || '#f3f4f6';
};

export default Receipts;