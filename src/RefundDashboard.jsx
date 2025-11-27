import React, { useEffect, useMemo, useState } from 'react';
import { databases, Query, ID, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, appwritePing } from './appwrite.js';
import RefundFormModal from './RefundFormModal.jsx';
import UpdateRefundModal from './UpdateRefundModal.jsx';

// Status is now a boolean in DB: false = Pending, true = Paid.
const STATUS_LABEL = (val) => (val ? 'Paid' : 'Pending');

function formatAmount(value) {
  if (!value) return '0.00';
  const n = Number(value.toString().replace(/,/g, ''));
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateDisplay(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return (iso || '').slice(0, 10);
  }
}

export default function RefundDashboard() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCreatedPopup, setShowCreatedPopup] = useState(null); // {doc, message}
  const [editTarget, setEditTarget] = useState(null); // refund doc to edit
  const [showProcessedPopup, setShowProcessedPopup] = useState(null); // {doc, message}
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [connectionOk, setConnectionOk] = useState(true);
  const [connectionDetails, setConnectionDetails] = useState(null); // { ok, stage, error }

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError('');
      // connectivity check (runs once at start of fetch sequence)
      const pingResult = await appwritePing();
      setConnectionDetails(pingResult);
      setConnectionOk(pingResult.ok);
      if (!pingResult.ok) {
        setError('Cannot reach Appwrite backend.');
        setLoading(false);
        return;
      }
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      setRefunds(res.documents || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load refunds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const totals = useMemo(() => {
    const total = refunds.reduce((sum, r) => sum + Number(r.Amount || 0), 0);
    const pending = refunds.filter((r) => r.Status === false);
    const paid = refunds.filter((r) => r.Status === true);
    return {
      totalCount: refunds.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      totalAmount: total,
    };
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return refunds;
    return refunds.filter((r) => {
      const hay = [
        r.Reference_Number,
        r.Contact,
        r.Mode_Refund,
        r.Remark,
        String(r.Amount),
        r.Date?.slice(0, 10),
        r.Closing_Date?.slice(0, 10),
        r.Refund_Date?.slice(0, 10),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [refunds, search]);

  const handleCreateRefund = async (payload) => {
    try {
      setError('');
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
          Reference_Number: payload.referenceNumber,
          Amount: payload.amount,
          Date: payload.date,
          Closing_Date: payload.closingDate,
            // Refund_Date left null until processed
          Refund_Date: null,
          Mode_Refund: payload.mode,
          Remark: payload.remark,
          Contact: payload.contact,
          Status: false, // boolean pending
        }
      );
      setRefunds((prev) => [doc, ...prev]);
      setShowForm(false);
  const closing = doc.Closing_Date || payload.closingDate || null;
  const copyMsg = `Your refund request has been created. Reference: ${doc.Reference_Number}. Please claim your refund within 15 days${closing ? ` (by ${formatDateDisplay(closing)})` : ''}. After this period, we will not be responsible for any delays or claims.`;
      setShowCreatedPopup({ doc, message: copyMsg });
      return doc;
    } catch (err) {
      console.error(err);
      setError('Failed to create refund.');
    }
  };

  const handleProcessRefund = async (refund) => {
    try {
      setProcessingId(refund.$id);
      setError('');
      const now = new Date().toISOString();
      const updated = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        refund.$id,
        {
          Status: true,
          Refund_Date: now,
        }
      );
      setRefunds((prev) => prev.map((r) => (r.$id === refund.$id ? updated : r)));
      const successMsg = `Refund processed successfully on ${formatDateDisplay(updated.Refund_Date || now)} for reference ${updated.Reference_Number}. Amount: ₹${formatAmount(updated.Amount)}.`;
      setShowProcessedPopup({ doc: updated, message: successMsg });
    } catch (err) {
      console.error(err);
      setError('Failed to update refund.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Refund Management</h1>
          <p>Customer refund tracking dashboard</p>
        </div>
        <button className="primary-btn" onClick={() => setShowForm(true)}>+ New Refund</button>
      </header>

      <section className="cards-row">
        <SummaryCard title="Total Refunds" value={totals.totalCount} pill="Live" />
        <SummaryCard title="Pending" value={totals.pendingCount} pill="Live" pillColor="orange" />
        <SummaryCard title="Paid" value={totals.paidCount} pill="Live" pillColor="green" />
        <SummaryCard title="Total Amount" value={`₹${formatAmount(totals.totalAmount)}`} pill="Live" />
      </section>

      <section className="table-card">
        <div className="table-header">
          <div>
            <h2>Refunds</h2>
            <p>Track pending and paid customer refunds</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search by reference, contact, mode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #444', background: 'transparent', color: 'inherit', minWidth: '260px' }}
            />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {!connectionOk && connectionDetails && (
          <div className="error-banner">
            <strong>Connection issue:</strong> {connectionDetails.error}
            <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.9 }}>
              Stage: {connectionDetails.stage}
              {' '}| Endpoint: {APPWRITE_DATABASE_ID ? 'DB ID set' : 'DB ID missing'} / {APPWRITE_COLLECTION_ID ? 'Collection ID set' : 'Collection ID missing'}
            </div>
            <button
              className="secondary-btn"
              style={{ marginTop: '8px' }}
              onClick={fetchRefunds}
            >Retry Ping</button>
          </div>
        )}
        {loading ? (
          <div className="loading">Loading refunds...</div>
        ) : filteredRefunds.length === 0 ? (
          <div className="empty-state">No refunds yet. Create one to start.</div>
        ) : (
          <table className="refund-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Closing Date</th>
                <th>Status</th>
                <th>Mode</th>
                <th>Remark</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((r) => (
                <tr key={r.$id}>
                  <td>{r.Reference_Number}</td>
                  <td>{formatAmount(r.Amount)}</td>
                  <td>{r.Date ? r.Date.slice(0, 10) : '-'}</td>
                  <td>{r.Closing_Date ? r.Closing_Date.slice(0, 10) : '-'}</td>
                  <td>
                    {r.Status === true ? (
                      <span className="status-pill status-paid">Paid</span>
                    ) : (
                      <span className="status-pill status-pending">Pending</span>
                    )}
                  </td>
                  <td>{r.Mode_Refund || '-'}</td>
                  <td>{r.Remark || '-'}</td>
                  <td>{r.Contact || '-'}</td>
                  <td>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <button
                        className="secondary-btn"
                        onClick={() => setEditTarget(r)}
                      >Edit</button>
                      {r.Status === false ? (
                        <button
                          className="process-btn"
                          disabled={processingId === r.$id}
                          onClick={() => handleProcessRefund(r)}
                        >
                          {processingId === r.$id ? 'Processing...' : 'Process Refund'}
                        </button>
                      ) : (
                        <span className="paid-info">
                          Paid on {r.Refund_Date ? r.Refund_Date.slice(0, 10) : r.$updatedAt.slice(0, 10)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showForm && (
        <RefundFormModal onClose={() => setShowForm(false)} onSubmit={handleCreateRefund} />
      )}
      {showCreatedPopup && (
        <div className="modal-backdrop">
          <div className="modal">
            <header className="modal-header">
              <h2>🎉 Refund Created</h2>
              <button className="icon-btn" onClick={() => setShowCreatedPopup(null)}>✕</button>
            </header>
            <div className="modal-body">
              <div style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, rgba(64,64,64,0.15), rgba(64,64,64,0.05))'
              }}>
                <p style={{ margin: 0 }}><strong>Reference:</strong> {showCreatedPopup.doc.Reference_Number}</p>
                <p style={{ margin: '6px 0 0 0' }}>
                  <strong>Date:</strong> {formatDateDisplay(showCreatedPopup.doc.Date)}
                </p>
                <p style={{ margin: '6px 0 0 0', color: 'orange' }}>
                  ⚠ Please claim your refund within 15 days
                  {showCreatedPopup.doc.Closing_Date ? ` (by ${formatDateDisplay(showCreatedPopup.doc.Closing_Date)})` : ''}.
                  After this period, we will not be responsible for any delays or claims.
                </p>
              </div>
              <div style={{ display:'flex', gap: '8px', marginTop: '12px', justifyContent:'flex-end' }}>
                <button
                  className="secondary-btn"
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(showCreatedPopup.message); } catch {}
                    setShowCreatedPopup(null);
                  }}
                >Copy Message</button>
                <button className="primary-btn" onClick={() => setShowCreatedPopup(null)}>Got it</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showProcessedPopup && (
        <div className="modal-backdrop">
          <div className="modal">
            <header className="modal-header">
              <h2>✅ Refund Processed</h2>
              <button className="icon-btn" onClick={() => setShowProcessedPopup(null)}>✕</button>
            </header>
            <div className="modal-body">
              <div style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, rgba(64,64,64,0.15), rgba(64,64,64,0.05))'
              }}>
                <p style={{ margin: 0 }}>
                  Refund for <strong>{showProcessedPopup.doc.Reference_Number}</strong> has been processed successfully.
                </p>
                <p style={{ margin: '6px 0 0 0' }}>
                  <strong>Date:</strong> {formatDateDisplay(showProcessedPopup.doc.Refund_Date || showProcessedPopup.doc.$updatedAt)}
                  {' '}• <strong>Amount:</strong> ₹{formatAmount(showProcessedPopup.doc.Amount)}
                </p>
              </div>
              <div style={{ display:'flex', gap:'8px', marginTop:'12px', justifyContent:'flex-end' }}>
                <button
                  className="secondary-btn"
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(showProcessedPopup.message); } catch {}
                    setShowProcessedPopup(null);
                  }}
                >Copy Message</button>
                <button className="primary-btn" onClick={() => setShowProcessedPopup(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <UpdateRefundModal
          refund={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={async (updates) => {
            try {
              setProcessingId(editTarget.$id);
              const updated = await databases.updateDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID,
                editTarget.$id,
                updates
              );
              setRefunds((prev) => prev.map((r) => (r.$id === updated.$id ? updated : r)));
              setEditTarget(null);
            } catch (e) {
              console.error(e);
              setError('Failed to update refund.');
            } finally {
              setProcessingId(null);
            }
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, pill, pillColor = 'blue' }) {
  return (
    <div className="summary-card">
      <div className="summary-top">
        <span className={`pill pill-${pillColor}`}>{pill}</span>
      </div>
      <div className="summary-bottom">
        <p className="summary-title">{title}</p>
        <p className="summary-value">{value}</p>
      </div>
    </div>
  );
}
