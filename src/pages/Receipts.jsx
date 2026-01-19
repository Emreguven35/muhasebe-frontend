import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Receipts() {
  const [activeTab, setActiveTab] = useState('receipts');
  const [receipts, setReceipts] = useState([]);
  const [zRaporlar, setZRaporlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

 const loadData = useCallback(async () => {
  setLoading(true);
  if (activeTab === 'receipts') {
    await loadReceipts();
  } else {
    await loadZRaporlar();
  }
  setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadReceipts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/api/receipts?userId=${user.id}`);
      setReceipts(response.data);
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const loadZRaporlar = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/api/z-reports?userId=${user.id}`);
      setZRaporlar(response.data);
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleEdit = (receipt) => {
    setEditingId(receipt.id);
    setEditForm({
      company_name: receipt.company_name || '',
      date: receipt.date || '',
      receipt_number: receipt.receipt_number || '',
      category: receipt.category || '',
      total: receipt.total || '',
      vat: receipt.vat || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.put(`${API_URL}/api/receipts/${id}?userId=${user.id}`, editForm);
      
      alert('✅ Fiş başarıyla güncellendi!');
      setEditingId(null);
      loadReceipts();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('❌ Güncelleme hatası: ' + error.message);
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm('Bu fişi silmek istediğinize emin misiniz?')) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`${API_URL}/api/receipts/${receiptId}?userId=${user.id}`);
      alert('✅ Fiş silindi!');
      loadReceipts();
    } catch (error) {
      alert('❌ Silme hatası: ' + error.message);
    }
  };

  const handleDeleteZRapor = async (id) => {
    if (!window.confirm('Bu Z raporunu silmek istediğinize emin misiniz?')) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`${API_URL}/api/z-reports/${id}?userId=${user.id}`);
      alert('✅ Z Raporu silindi!');
      loadZRaporlar();
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
      alert('Excel export özelliği yakında eklenecek!');
    } catch (error) {
      alert('❌ Hata: ' + error.message);
    }
  };

  const totals = {
    count: receipts.length,
    totalAmount: receipts.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0),
    totalVat: receipts.reduce((sum, r) => sum + (parseFloat(r.vat) || 0), 0)
  };

  const zTotals = {
    count: zRaporlar.length,
    toplamSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.total_sales) || 0), 0),
    nakitSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.cash_amount) || 0), 0),
    posSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.credit_card_amount) || 0), 0)
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
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>📋 Fişlerim</h1>
        
        {/* Sekmeler */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '20px',
          background: 'var(--gray-100)',
          padding: '4px',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => setActiveTab('receipts')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'receipts' ? 'white' : 'transparent',
              color: activeTab === 'receipts' ? 'var(--primary)' : 'var(--gray-800)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'receipts' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📄 Fişlerim ({receipts.length})
          </button>
          
          <button
            onClick={() => setActiveTab('zraporlar')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'zraporlar' ? 'white' : 'transparent',
              color: activeTab === 'zraporlar' ? 'var(--primary)' : 'var(--gray-800)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'zraporlar' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📊 Z Raporlarım ({zRaporlar.length})
          </button>
        </div>

        {activeTab === 'receipts' ? (
          <>
            {receipts.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button 
                  onClick={exportToExcel}
                  className="btn btn-success"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  📥 Excel İndir
                </button>
              </div>
            )}

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
                          <th style={headerStyle}>Fiş No</th>
                          <th style={headerStyle}>Firma</th>
                          <th style={headerStyle}>Kategori</th>
                          <th style={headerStyle}>Toplam</th>
                          <th style={headerStyle}>KDV</th>
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
                                  placeholder="YYYY-MM-DD"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={cellStyle}>
                                <input
                                  type="text"
                                  value={editForm.receipt_number}
                                  onChange={(e) => setEditForm({...editForm, receipt_number: e.target.value})}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={cellStyle}>
                                <input
                                  type="text"
                                  value={editForm.company_name}
                                  onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={cellStyle}>
                                <input
                                  type="text"
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={cellStyle}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.total}
                                  onChange={(e) => setEditForm({...editForm, total: e.target.value})}
                                  style={inputStyle}
                                />
                              </td>
                              <td style={cellStyle}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.vat}
                                  onChange={(e) => setEditForm({...editForm, vat: e.target.value})}
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
                              <td style={cellStyle}>{receipt.date || '-'}</td>
                              <td style={cellStyle}>{receipt.receipt_number || '-'}</td>
                              <td style={cellStyle}>{receipt.company_name || '-'}</td>
                              <td style={cellStyle}>
                                <span style={{
                                  background: getGiderColor(receipt.category),
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {receipt.category || 'Diğer'}
                                </span>
                              </td>
                              <td style={{...cellStyle, textAlign: 'right', fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace'}}>
                                {parseFloat(receipt.total || 0).toFixed(2)} ₺
                              </td>
                              <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px'}}>
                                {parseFloat(receipt.vat || 0).toFixed(2)} ₺
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
                          <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary)'}}>
                            {totals.totalVat.toFixed(2)} ₺
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
          </>
        ) : (
          <>
            {/* Z RAPORLARI TABLOSU */}
            {zRaporlar.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                <p style={{ fontSize: '18px', color: 'var(--gray-800)' }}>
                  Henüz Z raporu yüklemediniz
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
                      minWidth: '1000px'
                    }}>
                      <thead>
                        <tr style={{ background: 'var(--primary)' }}>
                          <th style={headerStyle}>Tarih</th>
                          <th style={headerStyle}>Mali No</th>
                          <th style={headerStyle}>Toplam Satış</th>
                          <th style={headerStyle}>Nakit</th>
                          <th style={headerStyle}>Kredi Kartı</th>
                          <th style={headerStyle}>Fiş Sayısı</th>
                          <th style={{...headerStyle, textAlign: 'center'}}>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zRaporlar.map((rapor, index) => (
                          <tr 
                            key={rapor.id}
                            style={{ 
                              background: index % 2 === 0 ? 'white' : '#f9fafb',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb'}
                          >
                            <td style={cellStyle}>
                              {rapor.report_date ? new Date(rapor.report_date).toLocaleDateString('tr-TR') : '-'}
                            </td>
                            <td style={cellStyle}>{rapor.fiscal_number || '-'}</td>
                            <td style={{...cellStyle, textAlign: 'right', fontWeight: '700', color: 'var(--success)', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.total_sales || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.cash_amount || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.credit_card_amount || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'center'}}>
                              {rapor.receipt_count || 0}
                            </td>
                            <td style={{...cellStyle, textAlign: 'center'}}>
                              <button
                                onClick={() => handleDeleteZRapor(rapor.id)}
                                style={deleteButtonStyle}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        <tr style={{ 
                          background: '#f3f4f6',
                          fontWeight: '700',
                          borderTop: '2px solid var(--primary)'
                        }}>
                          <td style={{...cellStyle, fontWeight: '700'}} colSpan="2">
                            TOPLAM ({zTotals.count} Rapor)
                          </td>
                          <td style={{...cellStyle, textAlign: 'right', fontSize: '16px', color: 'var(--success)', fontFamily: 'monospace'}}>
                            {zTotals.toplamSatis.toFixed(2)} ₺
                          </td>
                          <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                            {zTotals.nakitSatis.toFixed(2)} ₺
                          </td>
                          <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                            {zTotals.posSatis.toFixed(2)} ₺
                          </td>
                          <td colSpan="2"></td>
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
    'Yemek': '#fff3e0',
    'Ulaşım': '#e8f5e9',
    'Market': '#f3e5f5',
    'Eğlence': '#e3f2fd',
    'Sağlık': '#ffebee',
    'Giyim': '#f8bbd0',
    'Elektronik': '#e1f5fe',
    'Kırtasiye': '#fff9c4'
  };
  return colors[cinsi] || '#f3f4f6';
};

export default Receipts;