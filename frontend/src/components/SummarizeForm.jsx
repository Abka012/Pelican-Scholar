import React, { useState } from 'react';
import { summarizeFile } from "./api/summarizeFile";

const SummarizeForm = () => {
  const [file, setFile] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const result = await summarizeFile(file, summaryLength);
      setSummary(result.final_summary);
    } catch (err) {
      setError(err.message || 'Failed to summarize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Summarize Document</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>
            Summary Length:
            <select
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {summary && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default SummarizeForm;
