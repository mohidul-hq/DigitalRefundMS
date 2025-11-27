import React, { useState } from 'react';

const defaultClosingOffsetDays = 15;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function RefundFormModal({ onClose, onSubmit }) {
  const [referenceNumber, setReferenceNumber] = useState('REF-' + Date.now());
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [closingDate, setClosingDate] = useState(addDaysISO(todayISO(), defaultClosingOffsetDays));
  const [mode, setMode] = useState('UPI');
  const [remark, setRemark] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referenceNumber || !amount || !date || !contact) {
      setError('Reference #, amount, date and contact are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit({ referenceNumber, amount, date, closingDate, mode, remark, contact });
    } catch (err) {
      console.error(err);
      setError('Failed to create refund.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2>New Refund</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>
        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-grid">
            <label>
              Reference Number
              <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} required />
            </label>

            <label>
              Amount (₹)
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>

            <label>
              Date
              <input type="date" value={date} onChange={(e) => { const v = e.target.value; setDate(v); setClosingDate(addDaysISO(v, defaultClosingOffsetDays)); }} required />
            </label>

            <label>
              Contact
              <input
                type="text"
                maxLength={100}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Customer contact"
                required
              />
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

            <label className="full-width">
              Remark
              <textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Optional notes about this refund" />
            </label>
          </div>

          <footer className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Refund'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
