import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('No file selected');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : 'No file selected');
    setResponse(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>Upload your Financial CSV</h2>

        <input 
          type="file" 
          onChange={handleFileChange} 
          style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
        />
        <p style={{ color: '#666' }}>Selected file: {fileName}</p>

        <button 
          onClick={handleUpload} 
          disabled={!file || isLoading} 
          style={{
            padding: '10px 15px', 
            backgroundColor: isLoading || !file ? '#ccc' : '#007bff',
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading || !file ? 'not-allowed' : 'pointer', 
            width: '100%', 
            margin: '10px 0'
          }}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>

        {isLoading && (
          <div style={{ margin: '20px 0', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#007bff', animation: 'progress 2s linear infinite' }}></div>
          </div>
        )}

        {response && (
          <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Expense Categories</h3>
            {response.map((expense, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>Description:</strong> {expense.Description}<br />
                <strong>Amount:</strong> ${expense.Amount.toFixed(2)}<br />
                <strong>Category:</strong> {expense.Category}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;