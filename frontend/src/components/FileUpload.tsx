import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('No file selected');
  const [alerts, setAlerts] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : 'No file selected');
    setResponse(null);
    setAlerts([]);
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
      setResponse(res.data.expenses);
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    const response = await axios.get('http://localhost:5000/export/pdf', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'budget_report.pdf');
    document.body.appendChild(link);
    link.click();
  };

  const downloadExcel = async () => {
    const response = await axios.get('http://localhost:5000/export/excel', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'budget_report.xlsx');
    document.body.appendChild(link);
    link.click();
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

        {alerts.length > 0 && (
          <div style={{ marginTop: '20px', backgroundColor: '#ffcccc', padding: '15px', borderRadius: '8px' }}>
            <h3>Alerts</h3>
            {alerts.map((alert, index) => (
              <div key={index} style={{ marginBottom: '10px', color: '#d9534f' }}>
                {alert}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button 
            onClick={downloadPDF} 
            style={{
              padding: '10px 15px', 
              backgroundColor: '#28a745', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              width: '48%'
            }}>
            Download PDF Report
          </button>
          <button 
            onClick={downloadExcel} 
            style={{
              padding: '10px 15px', 
              backgroundColor: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              width: '48%'
            }}>
            Download Excel Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
