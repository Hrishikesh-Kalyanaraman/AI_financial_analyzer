import React, { useState } from "react";
import Papa from "papaparse";
import ExportReport from "./ExportReport";

const FileUpload = ({ onFileData }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [alerts, setAlerts] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data;
          const keys = Object.keys(parsedData[0]);
          setHeaders(keys);
          setData(parsedData);

          let income = 0;
          let expenses = 0;

          parsedData.forEach((row) => {
            const amount = parseFloat(row.Amount) || 0;
            if (row.Type === "Income") {
              income += amount;
            } else if (row.Type === "Expense") {
              expenses += amount;
            }
          });

          const savingsAmount = income + expenses;

          setTotalIncome(income);
          setTotalExpenses(expenses);
          setSavings(savingsAmount);

          const transactions = parsedData.map((row) => ({
            category: row.Category || "Other",
            type: row.Type || "Expense",
            amount: parseFloat(row.Amount) || 0,
          }));

          onFileData(transactions);
        },
      });
    }
  };

  return (
    <div style={{ margin: "20px auto", maxWidth: "800px", textAlign: "center", backgroundColor: '#fefefe', padding: '30px', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '30px', color: '#444', marginBottom: '25px', fontWeight: '600' }}>Upload Your Financial Data</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ padding: "12px", fontSize: "16px", border: "1px solid #ccc", borderRadius: '6px', marginBottom: "20px", width: "100%", boxSizing: 'border-box' }}
      />
  
      {data.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f7f9fc",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "25px",
              boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Total Income</h3>
              <p style={{ color: "green", fontSize: "20px", fontWeight: "bold" }}>${totalIncome.toFixed(2)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Total Expenses</h3>
              <p style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>${(-1 * totalExpenses).toFixed(2)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Savings</h3>
              <p style={{ color: "#333", fontSize: "20px", fontWeight: "bold" }}>${savings.toFixed(2)}</p>
            </div>
          </div>
  
          {alerts.length > 0 && (
            <div
              style={{
                backgroundColor: "#fff5f5",
                padding: "15px",
                borderRadius: "10px",
                color: "#d32f2f",
                marginBottom: "25px",
                border: "1px solid #f8d7da",
              }}
            >
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '500' }}>Budget Alerts</h3>
              {alerts.map((alert, index) => (
                <p key={index} style={{ fontSize: '16px', margin: '5px 0' }}>{alert}</p>
              ))}
            </div>
          )}
  
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "0 auto",
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      padding: "12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: '500',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        border: "1px solid #ddd",
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#555",
                      }}
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
  
          <ExportReport
            data={data}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            savings={savings}
          />
        </>
      )}
    </div>
  );
  



};

export default FileUpload;
