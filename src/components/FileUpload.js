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

          // Calculate income, expenses, and savings
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

          // Calculate savings as income - expenses
          const savingsAmount = income + expenses;

          // Update state for totals
          setTotalIncome(income);
          setTotalExpenses(expenses);
          setSavings(savingsAmount);

          // Transform the data to match the expected format for the parent component
          const transactions = parsedData.map((row) => ({
            category: row.Category || "Other",
            type: row.Type || "Expense",
            amount: parseFloat(row.Amount) || 0,
          }));

          // Send parsed transactions back to the parent component
          onFileData(transactions); // Pass data to the parent component
        },
      });
    }
  };

  return (
    <div style={{ margin: "20px auto", maxWidth: "800px", textAlign: "center", backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>Upload Financial Data</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: '4px', marginBottom: "20px" }}
      />

      {data.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3>Total Income</h3>
              <p style={{ color: "green", fontSize: "18px", fontWeight: "bold" }}>${totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <h3>Total Expenses</h3>
              <p style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}>${(-1*totalExpenses).toFixed(2)}</p>
            </div>
            <div>
              <h3>Savings</h3>
              <p style={{ color: "#333", fontSize: "18px", fontWeight: "bold" }}>${savings.toFixed(2)}</p>
            </div>
          </div>

          {alerts.length > 0 && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                padding: "10px",
                borderRadius: "8px",
                color: "#721c24",
                marginBottom: "20px",
              }}
            >
              <h3>Budget Alerts</h3>
              {alerts.map((alert, index) => (
                <p key={index}>{alert}</p>
              ))}
            </div>
          )}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "0 auto",
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
                      padding: "10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      textAlign: "center",
                      fontSize: "16px"
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
                        padding: "8px",
                        textAlign: "left",
                        fontSize: "14px",
                        color: "#333",
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
