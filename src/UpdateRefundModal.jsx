import React, { useMemo, useState } from 'react';

function toDateInput(iso) {
  if (!iso) return '';
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return ''; }
}

function toISO(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString();
}

export default function UpdateRefundModal({ refund, onClose, onSubmit }) {
  // Editable fields
  const [amount, setAmount] = useState(refund.Amount || '');
  const [closingDate, setClosingDate] = useState(toDateInput(refund.Closing_Date));
  const [mode, setMode] = useState(refund.Mode_Refund || 'UPI');
  const [remark, setRemark] = useState(refund.Remark || '');
  const [contact, setContact] = useState(refund.Contact || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => !!(contact && amount), [contact, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Amount and Contact are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        Amount: amount,
        Closing_Date: toISO(closingDate),
        Mode_Refund: mode,
        Remark: remark,
        Contact: contact,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to update refund.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2>Edit Refund</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>
        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-grid">
            <label>
              Reference Number
              <input type="text" value={refund.Reference_Number} disabled />
            </label>
            <label>
              Amount (₹)
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
            <label>
              Closing Date
              <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
            </label>
            <label>
              Mode of Refund
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Wallet">Wallet</option>
                <option value="Cash">Cash</option>
              </select>
            </label>
            <label>
              Contact
              <input type="text" maxLength={100} value={contact} onChange={(e) => setContact(e.target.value)} required />
            </label>
            <label className="full-width">
              Remark
              <textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} />
            </label>
          </div>
          <footer className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="primary-btn" type="submit" disabled={!canSubmit || submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
