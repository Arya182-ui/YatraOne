import React, { useState } from 'react';
import Papa from 'papaparse';

const TYPES = [
  { value: 'buses', label: 'Buses' },
  { value: 'users', label: 'Users' },
  { value: 'routes', label: 'Routes' },
  { value: 'lostfound', label: 'Lost & Found' },
];

const BatchUpload: React.FC = () => {
  const [type, setType] = useState('buses');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setCsvData(results.data as any[]);
      },
      error: (err: any) => setError('CSV parsing error: ' + err.message),
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/batch-upload/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: csvData }),
      });
      if (!res.ok) throw new Error('Upload failed');
      setSuccess('Batch upload successful!');
      setCsvData([]);
      setFileName('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
  };

  return (
  <div className="p-8 mt-10 mb-10 border rounded-2xl bg-white dark:bg-gray-900 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Batch Upload</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Upload CSVs for Buses, Users, Routes, or Lost &amp; Found.</p>
        </div>
      </div>
  <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <label className="font-medium">Type:</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {fileName && <div className="mb-3 text-xs text-blue-600 dark:text-blue-300">Selected: {fileName}</div>}
      {csvData.length > 0 && (
        <div className="mb-6 max-h-48 overflow-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-xs">
          <div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Preview ({csvData.length} rows):</div>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(csvData.slice(0, 10), null, 2)}{csvData.length > 10 ? '\n...and more' : ''}</pre>
        </div>
      )}
      <button
        className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
        onClick={handleSubmit}
        disabled={csvData.length === 0}
      >
        <span className="inline-flex items-center gap-2 justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
          Upload
        </span>
      </button>
      {error && <div className="text-red-600 mt-4 text-sm font-medium">{error}</div>}
      {success && <div className="text-green-600 mt-4 text-sm font-medium">{success}</div>}
    </div>
  );
};

export default BatchUpload;
