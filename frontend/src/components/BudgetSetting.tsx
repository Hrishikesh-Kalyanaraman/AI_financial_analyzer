import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BudgetSetting() {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const response = await axios.get('http://localhost:5000/get_budgets');
    setBudgets(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/set_budget', { category, amount: parseFloat(amount) });
    fetchBudgets();
    setCategory('');
    setAmount('');
  };

  return (
    <div>
      <h2>Set Budget</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <button type="submit">Set Budget</button>
      </form>
      <h3>Current Budgets</h3>
      <ul>
        {Object.entries(budgets).map(([cat, amt]) => (
          <li key={cat}>{cat}: ${amt}</li>
        ))}
      </ul>
    </div>
  );
}

export default BudgetSetting;
