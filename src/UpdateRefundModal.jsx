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
  const [fieldErrors, setFieldErrors] = useState({});

  const canSubmit = useMemo(() => !!(contact && amount), [contact, amount]);

  const validate = () => {
    const errs = {};
    const amt = parseFloat(String(amount).replace(/,/g, ''));
    if (!Number.isFinite(amt) || amt <= 0) errs.amount = 'Amount must be a positive number.';
    const digits = String(contact).replace(/\D/g, '');
    if (digits.length !== 10) errs.contact = 'Contact must be exactly 10 digits.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !validate()) {
      setError('Please fix the highlighted fields.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const cleanContact = String(contact).replace(/\D/g, '').slice(0, 10);
      await onSubmit({
        Amount: amount,
        Closing_Date: toISO(closingDate),
        Mode_Refund: mode,
        Remark: remark,
        Contact: cleanContact,
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
              <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              {fieldErrors.amount && <small className="field-error">{fieldErrors.amount}</small>}
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
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={contact}
                onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
              {fieldErrors.contact && <small className="field-error">{fieldErrors.contact}</small>}
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
