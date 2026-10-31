import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { extractInvestigation, analyzeInvestigation, clearError } from '../slices/rcaSlice';

export default function AICopilotDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading, extraction, analysis, error } = useSelector((state) => state.rca);
  const [panel, setPanel] = useState('extract'); // 'extract' | 'analyze' | 'results'
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleExtract = (e) => {
    e.preventDefault();
    dispatch(extractInvestigation({ rawText, file }));
    setPanel('analyze');
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    dispatch(analyzeInvestigation({ rawText }));
    setPanel('results');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>🤖</span> AI Copilot (RCA Assistant)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
              &times;
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-slate-50 text-sm">
            <button
              onClick={() => setPanel('extract')}
              className={`flex-1 py-2.5 font-medium border-b-2 ${panel === 'extract' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}
            >
              1. Extract
            </button>
            <button
              onClick={() => setPanel('analyze')}
              className={`flex-1 py-2.5 font-medium border-b-2 ${panel === 'analyze' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}
            >
              2. Analyze
            </button>
            <button
              onClick={() => setPanel('results')}
              className={`flex-1 py-2.5 font-medium border-b-2 ${panel === 'results' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}
            >
              3. Results
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
              </div>
            )}

            {panel === 'extract' && (
              <form onSubmit={handleExtract} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paste Deviation / Complaint Text</label>
                  <textarea
                    rows="6"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Paste raw deviation notes here..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Or Upload PDF Document</label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition"
                >
                  {loading ? 'Extracting...' : 'Extract Parameters'}
                </button>
              </form>
            )}

            {panel === 'analyze' && (
              <form onSubmit={handleAnalyze} className="space-y-4">
                <p className="text-xs text-slate-500">Run the full AI-powered RCA workflow: extraction → 5-Whys → CAPA recommendations.</p>
                {extraction && (
                  <div className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1">
                    <p className="font-bold text-slate-700">Extracted Data Preview:</p>
                    <p><span className="text-slate-500">Batch:</span> {extraction.batch_id || 'N/A'}</p>
                    <p><span className="text-slate-500">Product:</span> {extraction.product_name || 'N/A'}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition"
                >
                  {loading ? 'Analyzing...' : 'Run Full AI RCA'}
                </button>
              </form>
            )}

            {panel === 'results' && (
              <div className="space-y-4 text-sm">
                {analysis ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                      Analysis completed successfully!
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">RCAs & Findings</h4>
                      <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No analysis generated yet. Run the workflow from the extract or analyze tab.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}