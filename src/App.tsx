import { useState } from 'react'
import './App.css'

interface FormState {
  amount: string;
  term: string;
  rate: string;
  type: 'repayment' | 'interest-only' | '';
}

interface Results {
  monthly: number;
  total: number;
}

function App() {
  const [form, setForm] = useState<FormState>({
    amount: '',
    term: '',
    rate: '',
    type: ''
  });

  const [results, setResults] = useState<Results | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleClear = () => {
    setForm({ amount: '', term: '', rate: '', type: '' });
    setResults(null);
    setErrors({});
  };

  const formatNumber = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = new Intl.NumberFormat('en-GB').format(Number(parts[0].replace(/,/g, '')));
    return parts.join('.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setForm({ ...form, amount: formatNumber(rawValue) });
    }
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.amount) newErrors.amount = 'This field is required';
    if (!form.term) newErrors.term = 'This field is required';
    if (!form.rate) newErrors.rate = 'This field is required';
    if (!form.type) newErrors.type = 'This field is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResults(null);
      return;
    }

    setErrors({});
    const P = parseFloat(form.amount.replace(/,/g, ''));
    const annualRate = parseFloat(form.rate);
    const years = parseFloat(form.term);

    const i = annualRate / 100 / 12;
    const n = years * 12;

    let monthly = 0;
    let total = 0;

    if (form.type === 'repayment') {
      monthly = (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      total = monthly * n;
    } else {
      monthly = P * i;
      total = monthly * n;
    }

    setResults({ monthly, total });
  };

  return (
    <main className="app-container">
      <section className="calculator-card">
        <div className="form-section">
          <header className="form-header">
            <h1>Mortgage Calculator</h1>
            <button className="clear-btn" onClick={handleClear}>Clear All</button>
          </header>

          <form onSubmit={calculate}>
            {/* Amount */}
            <div className={`form-group ${errors.amount ? 'error' : ''}`}>
              <label htmlFor="amount">Mortgage Amount</label>
              <div className="input-wrapper">
                <span className="unit">£</span>
                <input
                  id="amount"
                  type="text"
                  value={form.amount}
                  onChange={handleAmountChange}
                />
              </div>
              {errors.amount && <p className="error-msg">{errors.amount}</p>}
            </div>

            <div className="row">
              {/* Term */}
              <div className={`form-group ${errors.term ? 'error' : ''}`}>
                <label htmlFor="term">Mortgage Term</label>
                <div className="input-wrapper reverse">
                  <span className="unit">years</span>
                  <input
                    id="term"
                    type="number"
                    value={form.term}
                    onChange={(e) => setForm({ ...form, term: e.target.value })}
                  />
                </div>
                {errors.term && <p className="error-msg">{errors.term}</p>}
              </div>

              {/* Rate */}
              <div className={`form-group ${errors.rate ? 'error' : ''}`}>
                <label htmlFor="rate">Interest Rate</label>
                <div className="input-wrapper reverse">
                  <span className="unit">%</span>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  />
                </div>
                {errors.rate && <p className="error-msg">{errors.rate}</p>}
              </div>
            </div>

            {/* Type */}
            <div className={`form-group ${errors.type ? 'error' : ''}`}>
              <label>Mortgage Type</label>
              <div className="radio-group">
                <label className={`radio-label ${form.type === 'repayment' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={form.type === 'repayment'}
                    onChange={() => setForm({ ...form, type: 'repayment' })}
                  />
                  Repayment
                </label>
                <label className={`radio-label ${form.type === 'interest-only' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={form.type === 'interest-only'}
                    onChange={() => setForm({ ...form, type: 'interest-only' })}
                  />
                  Interest Only
                </label>
              </div>
              {errors.type && <p className="error-msg">{errors.type}</p>}
            </div>

            <button type="submit" className="submit-btn outline">
              <img src="/icon-calculator.svg" alt="" />
              Calculate Repayments
            </button>
          </form>
        </div>

        <div className="results-section" aria-live="polite">
          {!results ? (
            <div className="empty-state">
              <img src="/illustration-empty.svg" alt="" />
              <h2>Results shown here</h2>
              <p>
                Complete the form and click "calculate repayments" to see what
                your monthly repayments would be.
              </p>
            </div>
          ) : (
            <div className="completed-state">
              <h2>Your results</h2>
              <p>
                Your results are shown below based on the information you provided.
                To adjust the results, edit the form and click "calculate repayments" again.
              </p>
              <div className="results-box">
                <div className="monthly-result">
                  <p>Your monthly repayments</p>
                  <span className="amount">£{results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <hr />
                <div className="total-result">
                  <p>Total you'll repay over the term</p>
                  <span className="amount">£{results.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
