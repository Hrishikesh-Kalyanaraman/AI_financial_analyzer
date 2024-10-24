import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Financial Analyzer</h1>
        <nav className="app-nav">
          <ul>
            <li><a href="#upload">Upload</a></li>
            <li><a href="#summary">View Summary</a></li>
            <li><a href="#report">Generate Report</a></li>
            <li><a href="#budget">Set Budget</a></li>
          </ul>
        </nav>
      </header>
      
      <main>
        <section id="upload" className="app-section">
          <h2>Upload Your Financial Data</h2>
          <p>Upload your CSV file to analyze transactions and get insights.</p>
          <FileUpload />
        </section>

        <section id="summary" className="app-section">
          <h2>Transaction Summary</h2>
          <p>View your categorized transactions and monthly summaries here.</p>
          {/* Placeholder for summary content */}
        </section>

        <section id="report" className="app-section">
          <h2>Generate Report</h2>
          <p>Generate a comparison report between months or years.</p>
          {/* Placeholder for report generation */}
        </section>

        <section id="budget" className="app-section">
          <h2>Set Budget Limits</h2>
          <p>Set category-specific budget limits and track your expenses.</p>
          {/* Placeholder for budget input */}
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 AI Financial Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;