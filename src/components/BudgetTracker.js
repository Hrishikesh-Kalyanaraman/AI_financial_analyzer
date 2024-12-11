import React, { useState, useEffect } from 'react';

const BudgetTracker = ({ categories, onBudgetChange, currentSpending, budgets }) => {
  // Debugging log to check the props being passed
//   console.log('Categories:', categories);
//   console.log('Budgets:', budgets);
//   console.log('Current Spending:', currentSpending); // Check if currentSpending is updating correctly

  // Ensure categories is always an array, even if undefined or null
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Ensure budgets is always an object or fallback to an empty object
  const safeBudgets = budgets && typeof budgets === 'object' ? budgets : {};

  const [budgetInputs, setBudgetInputs] = useState({ ...safeBudgets });
  const [budgetStatus, setBudgetStatus] = useState({});

  // This useEffect will run only once when the component is mounted, to get data from localStorage
  useEffect(() => {
    // Get budget data from localStorage if it exists
    const savedBudgetData = localStorage.getItem('budgetData');
    if (savedBudgetData) {
      const parsedBudgetData = JSON.parse(savedBudgetData);
      const newBudgetInputs = {};

      parsedBudgetData.forEach((category) => {
        newBudgetInputs[category.name] = category.budget;
      });

      setBudgetInputs(newBudgetInputs);
    }
  }, []);  // Empty dependency array to ensure it runs only once when the component mounts

  // This useEffect will run only when currentSpending or budgetInputs change, to update the budget status
  useEffect(() => {
    const newBudgetStatus = {};
    safeCategories.forEach((category) => {
      const budget = budgetInputs[category] || 0;
      const spending = currentSpending[category] || 0;
      newBudgetStatus[category] = -1*spending > budget ? 'Over Budget' : 'Under Budget';
    });

    newBudgetStatus['Miscellaneous'] = (currentSpending['Miscellaneous'] || 0) > (budgetInputs['Miscellaneous'] || 0) 
      ? 'Over Budget' : 'Under Budget';
    setBudgetStatus(newBudgetStatus);
  }, [currentSpending, safeCategories, budgetInputs]);  // Re-run when currentSpending, safeCategories, or budgetInputs change

  const handleBudgetChange = (category, value) => {
    const newBudgetInputs = { ...budgetInputs, [category]: parseFloat(value || 0) };
    setBudgetInputs(newBudgetInputs);  // This triggers the budget status update when the input changes
  };

  const handleSaveBudgets = () => {
    const updatedBudget = safeCategories.map((category) => ({
      name: category,
      budget: budgetInputs[category] || 0,
      spent: currentSpending[category] || 0,
      status: currentSpending[category] > budgetInputs[category] ? "over budget" : "under budget"
    }));

    // Save the updated budget to localStorage
    localStorage.setItem('budgetData', JSON.stringify(updatedBudget));

    // Call the onBudgetChange prop function to update parent component state
    onBudgetChange(updatedBudget);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', textAlign: 'center' }}>Set Your Budget</h3>
      {safeCategories.map((category) => (
        <div key={category} style={{ marginBottom: "20px", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontSize: '16px' }}>{category} Budget: </label>
          <input
            type="number"
            value={budgetInputs[category] || ""}
            onChange={(e) => handleBudgetChange(category, e.target.value)}
            placeholder="Set budget"
            style={{
              padding: "8px",
              fontSize: "14px",
              width: "120px",
              border: "1px solid #ccc",
              borderRadius: '4px',
            }}
          />
          <div style={{ marginLeft: '20px', textAlign: 'left', fontSize: '14px' }}>
            <p>Spent: ${-1 * currentSpending[category] || 0}</p>
            <p style={{ color: budgetStatus[category] === 'Over Budget' ? 'red' : 'green' }}>
              {budgetStatus[category] || 'Set your budget and click "Save Budgets"'}
            </p>
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleSaveBudgets}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Save Budgets
        </button>
      </div>
    </div>
  );
};

export default BudgetTracker;
