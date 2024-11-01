import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [budgetData, setBudgetData] = useState<{ [key: string]: number }>({});
  
  // Fetch budget data and expenses data from the backend
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get_budgets');
        setBudgetData(res.data);
      } catch (err) {
        console.error("Error fetching budget data:", err);
      }
    };

    const fetchExpensesData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/upload');
        setExpenses(res.data.expenses);
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error("Error fetching expenses data:", err);
      }
    };

    fetchBudgetData();
    fetchExpensesData();
  }, []);

  // Aggregate expenses by category for visualization
  const expenseTotals = expenses.reduce((acc, expense) => {
    acc[expense.Category] = (acc[expense.Category] || 0) + expense.Amount;
    return acc;
  }, {});

  const budgetComparisonData = {
    labels: Object.keys(budgetData),
    datasets: [
      {
        label: 'Budgeted Amount',
        data: Object.keys(budgetData).map(key => budgetData[key]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Actual Spending',
        data: Object.keys(budgetData).map(key => expenseTotals[key] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const spendingDistributionData = {
    labels: Object.keys(expenseTotals),
    datasets: [
      {
        data: Object.values(expenseTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Financial Dashboard</h1>
      <FileUpload />

      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '30px 0' }}>
        <div style={{ padding: '20px', backgroundColor: '#e0f7fa', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Budget</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${Object.values(budgetData).reduce((a, b) => a + b, 0).toFixed(2)}
          </p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Spending</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${Object.values(expenseTotals).reduce((a, b) => a + b, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <h2 style={{ textAlign: 'center' }}>Budget vs Actual Spending</h2>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', margin: '20px 0' }}>
        <Bar data={budgetComparisonData} options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Budget vs Spending by Category' },
          },
        }} />
      </div>

      <h2 style={{ textAlign: 'center' }}>Spending Distribution</h2>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', margin: '20px 0' }}>
        <Pie data={spendingDistributionData} options={{
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            title: { display: true, text: 'Spending Distribution by Category' },
          },
        }} />
      </div>

      {alerts.length > 0 && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
          <h2>Budget Alerts</h2>
          {alerts.map((alert, index) => (
            <p key={index} style={{ color: '#d32f2f', fontWeight: 'bold' }}>{alert}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
