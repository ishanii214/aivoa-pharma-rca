import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { extractInvestigation, clearError } from '../slices/rcaSlice';

export default function IntakePanel() {
  const dispatch = useDispatch();
  const { loading, extraction, error } = useSelector((state) => state.rca);
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(extractInvestigation({ rawText, file }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="mb-4 border-b pb-3">
        <h3 className="text-lg font-bold text-slate-800">Intake Panel</h3>
        <p className="text-xs text-slate-500">Extract batch ID, product name, and deviation details from uploaded PDFs or text.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Deviation Description</label>
          <textarea
            rows="4"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Describe the deviation, batch issue, or quality event..."
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Batch Record (PDF)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button type="button" onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition shadow"
        >
          {loading ? 'Extracting Data...' : 'Run Extraction'}
        </button>
      </form>

      {extraction && (
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
          <h4 className="font-bold text-slate-700 mb-2">Extracted Data Summary</h4>
          <p><span className="text-slate-500">Batch ID:</span> <span className="font-semibold">{extraction.batch_id || 'N/A'}</span></p>
          <p><span className="text-slate-500">Product:</span> <span className="font-semibold">{extraction.product_name || 'N/A'}</span></p>
        </div>
      )}
    </div>
  );
}