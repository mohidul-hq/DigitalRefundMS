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
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    // Amount must be a positive number
    const amt = parseFloat(String(amount).replace(/,/g, ''));
    if (!Number.isFinite(amt) || amt <= 0) {
      errs.amount = 'Amount must be a positive number.';
    }
    // Contact must be exactly 10 digits (ignore spaces, dashes)
    const digits = String(contact).replace(/\D/g, '');
    if (digits.length !== 10) {
      errs.contact = 'Contact must be exactly 10 digits.';
    }
    // Date required; Closing Date should not be before Date
    if (!date) {
      errs.date = 'Date is required.';
    }
    if (closingDate && date && new Date(closingDate) < new Date(date)) {
      errs.closingDate = 'Closing date cannot be earlier than date.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referenceNumber || !amount || !date || !contact) {
      setError('Reference #, amount, date and contact are required.');
      validate();
      return;
    }
    if (!validate()) {
      setError('Please fix the highlighted fields.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const cleanContact = String(contact).replace(/\D/g, '').slice(0, 10);
      await onSubmit({ referenceNumber, amount, date, closingDate, mode, remark, contact: cleanContact });
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
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {fieldErrors.amount && <small className="field-error">{fieldErrors.amount}</small>}
            </label>

            <label>
              Date
              <input type="date" value={date} onChange={(e) => { const v = e.target.value; setDate(v); setClosingDate(addDaysISO(v, defaultClosingOffsetDays)); }} required />
              {fieldErrors.date && <small className="field-error">{fieldErrors.date}</small>}
            </label>

            <label>
              Contact
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={contact}
                onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                required
              />
              {fieldErrors.contact && <small className="field-error">{fieldErrors.contact}</small>}
            </label>

            <label>
              Closing Date
              <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
              {fieldErrors.closingDate && <small className="field-error">{fieldErrors.closingDate}</small>}
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
