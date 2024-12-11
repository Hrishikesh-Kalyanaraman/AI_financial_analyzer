import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportReport = ({ data, totalIncome, totalExpenses, savings }) => {
  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text("Financial Summary Report", 20, 20);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 20, 30);
    doc.text(`Total Expenses: $${(-1*totalExpenses).toFixed(2)}`, 20, 40);
    doc.text(`Savings: $${savings.toFixed(2)}`, 20, 50);
    
    const header = ["Date", "Category", "Description", "Amount"];
    const rows = data.map((row) => [
        row.Date || "N/A", 
        row.Category || "N/A", 
        row.Description || "N/A", 
        row.Amount || "0"
    ]);
    
    doc.autoTable({
        head: [header],
        body: rows,
        startY: 60,
        styles: {
          cellPadding: 5,
          fontSize: 10,
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
    });
    
    doc.save("financial_report.pdf");
  };

  const handleExcelExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    XLSX.writeFile(wb, "financial_report.xlsx");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={handlePDFExport}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "12px 20px",
          margin: "10px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Export to PDF
      </button>
      <button
        onClick={handleExcelExport}
        style={{
          backgroundColor: "#2196F3",
          color: "white",
          padding: "12px 20px",
          margin: "10px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default ExportReport;
