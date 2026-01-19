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
      firma_unvani: receipt.firma_unvani || '',
      tarih: receipt.tarih || '',
      fis_no: receipt.fis_no || '',
      gider_cinsi: receipt.gider_cinsi || '',
      toplam_tutar: receipt.toplam_tutar || '',
      kdv1: receipt.kdv1 || '',
      kdv10: receipt.kdv10 || '',
      kdv20: receipt.kdv20 || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // API'ye güncellenmiş verileri gönderiyoruz
      await axios.put(`${API_URL}/api/receipts/${id}?userId=${user.id}`, editForm);
      
      alert('✅ Fiş başarıyla güncellendi!');
      setEditingId(null); // Düzenleme modundan çık
      loadReceipts();    // Listeyi yenile
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('❌ Güncelleme sırasında bir hata oluştu: ' + (error.response?.data?.message || error.message));
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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/api/zrapor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
    totalAmount: receipts.reduce((sum, r) => sum + (parseFloat(r.toplam_tutar) || 0), 0),
    kdv1: receipts.reduce((sum, r) => sum + (parseFloat(r.kdv1) || 0), 0),
    kdv10: receipts.reduce((sum, r) => sum + (parseFloat(r.kdv10) || 0), 0),
    kdv20: receipts.reduce((sum, r) => sum + (parseFloat(r.kdv20) || 0), 0)
  };

  const zTotals = {
    count: zRaporlar.length,
    toplamSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.toplam_satis) || 0), 0),
    nakitSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.nakit_satis) || 0), 0),
    posSatis: zRaporlar.reduce((sum, r) => sum + (parseFloat(r.pos_satis) || 0), 0)
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
                          <th style={headerStyle}>Fatura No</th>
                          <th style={headerStyle}>Firma</th>
                          <th style={headerStyle}>Gider Cinsi</th>
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
                                  <option value="GİYİM">GİYİM</option>
                                  <option value="MARKET">MARKET</option>
                                  <option value="GIDA">GIDA</option>           
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="%1"
                                    value={editForm.kdv1}
                                    onChange={(e) => setEditForm({...editForm, kdv1: e.target.value})}
                                    style={{...inputStyle, fontSize: '12px'}}
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="%10"
                                    value={editForm.kdv10}
                                    onChange={(e) => setEditForm({...editForm, kdv10: e.target.value})}
                                    style={{...inputStyle, fontSize: '12px'}}
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="%20"
                                    value={editForm.kdv20}
                                    onChange={(e) => setEditForm({...editForm, kdv20: e.target.value})}
                                    style={{...inputStyle, fontSize: '12px'}}
                                  />
                                </div>
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
                              <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px'}}>
                                {receipt.kdv1 && parseFloat(receipt.kdv1) > 0 && (
                                  <div style={{ marginBottom: '2px' }}>
                                    <span style={{ fontWeight: '600' }}>%1:</span> {parseFloat(receipt.kdv1).toFixed(2)} ₺
                                  </div>
                                )}
                                {receipt.kdv10 && parseFloat(receipt.kdv10) > 0 && (
                                  <div style={{ marginBottom: '2px' }}>
                                    <span style={{ fontWeight: '600' }}>%10:</span> {parseFloat(receipt.kdv10).toFixed(2)} ₺
                                  </div>
                                )}
                                {receipt.kdv20 && parseFloat(receipt.kdv20) > 0 && (
                                  <div>
                                    <span style={{ fontWeight: '600' }}>%20:</span> {parseFloat(receipt.kdv20).toFixed(2)} ₺
                                  </div>
                                )}
                                {(!receipt.kdv1 || parseFloat(receipt.kdv1) === 0) && 
                                 (!receipt.kdv10 || parseFloat(receipt.kdv10) === 0) && 
                                 (!receipt.kdv20 || parseFloat(receipt.kdv20) === 0) && (
                                  <span style={{ color: 'var(--gray-400)' }}>-</span>
                                )}
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
                            {totals.kdv1 > 0 && <div>%1: {totals.kdv1.toFixed(2)}</div>}
                            {totals.kdv10 > 0 && <div>%10: {totals.kdv10.toFixed(2)}</div>}
                            {totals.kdv20 > 0 && <div>%20: {totals.kdv20.toFixed(2)}</div>}
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
                          <th style={headerStyle}>Z No</th>
                          <th style={headerStyle}>Toplam Satış</th>
                          <th style={headerStyle}>Nakit</th>
                          <th style={headerStyle}>POS</th>
                          <th style={headerStyle}>Kredili</th>
                          <th style={headerStyle}>KDV</th>
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
                            <td style={cellStyle}>{rapor.tarih || '-'}</td>
                            <td style={cellStyle}>{rapor.rapor_no || '-'}</td>
                            <td style={{...cellStyle, textAlign: 'right', fontWeight: '700', color: 'var(--success)', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.toplam_satis || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.nakit_satis || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.pos_satis || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace'}}>
                              {parseFloat(rapor.kredili_satis || 0).toFixed(2)} ₺
                            </td>
                            <td style={{...cellStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px'}}>
                              {rapor.kdv1 && parseFloat(rapor.kdv1) > 0 && (
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: '600' }}>%1:</span> {parseFloat(rapor.kdv1).toFixed(2)} ₺
                                </div>
                              )}
                              {rapor.kdv10 && parseFloat(rapor.kdv10) > 0 && (
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: '600' }}>%10:</span> {parseFloat(rapor.kdv10).toFixed(2)} ₺
                                </div>
                              )}
                              {rapor.kdv20 && parseFloat(rapor.kdv20) > 0 && (
                                <div>
                                  <span style={{ fontWeight: '600' }}>%20:</span> {parseFloat(rapor.kdv20).toFixed(2)} ₺
                                </div>
                              )}
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
                          <td colSpan="3"></td>
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
    'OTOPARK': '#e3f2fd',
    'MARKET': '#f3e5f5',
    'GIDA': '#fff9c4',
    'GİYİM': '#f8bbd0',
    'YİYECEK': '#fff3e0',
    'YAKIT': '#ffebee',
    'ULAŞIM': '#e8f5e9'
  };
  return colors[cinsi] || '#f3f4f6';
};

export default Receipts;