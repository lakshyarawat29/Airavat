import { useState } from 'react';
import { submitLog } from '../api/logs';

export default function LogForm() {
  const [formData, setFormData] = useState({
    requestId: '',
    agent: '',
    status: 'SAFE',
    riskScore: 1,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      timestamp: Math.floor(Date.now() / 1000),
    };
    const res = await submitLog(payload);
    setLoading(false);

    setToast({
      type: res.success ? 'success' : 'error',
      message: res.success
        ? `✅ Log submitted! Tx: ${res.txHash.slice(0, 10)}...`
        : `❌ Error: ${res.error}`,
    });

    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-xl p-6 shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        📝 Submit New Log
      </h2>

      {toast && (
        <div
          className={`mb-4 p-3 rounded text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="requestId"
          placeholder="Request ID"
          className="input"
          onChange={handleChange}
          required
        />
        <input
          name="agent"
          placeholder="Agent Name"
          className="input"
          onChange={handleChange}
          required
        />
        <select name="status" className="input" onChange={handleChange}>
          <option value="SAFE">SAFE</option>
          <option value="UNSAFE">UNSAFE</option>
        </select>
        <input
          type="number"
          name="riskScore"
          min="0"
          max="10"
          placeholder='Risk Score'
          className="input"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all flex items-center justify-center w-full"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : null}
          {loading ? 'Submitting...' : 'Submit Log'}
        </button>
      </form>
    </div>
  );
}
