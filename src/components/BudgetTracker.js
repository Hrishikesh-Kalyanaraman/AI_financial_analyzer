import React, { useState, useEffect } from 'react';

const BudgetTracker = ({ categories, onBudgetChange, currentSpending, budgets }) => {
//   console.log('Categories:', categories);
//   console.log('Budgets:', budgets);
//   console.log('Current Spending:', currentSpending); // Check if currentSpending is updating correctly

  const safeCategories = Array.isArray(categories) ? categories : [];
  
  const safeBudgets = budgets && typeof budgets === 'object' ? budgets : {};

  const [budgetInputs, setBudgetInputs] = useState({ ...safeBudgets });
  const [budgetStatus, setBudgetStatus] = useState({});

  useEffect(() => {
    const savedBudgetData = localStorage.getItem('budgetData');
    if (savedBudgetData) {
      const parsedBudgetData = JSON.parse(savedBudgetData);
      const newBudgetInputs = {};

      parsedBudgetData.forEach((category) => {
        newBudgetInputs[category.name] = category.budget;
      });

      setBudgetInputs(newBudgetInputs);
    }
  }, []);

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
  }, [currentSpending, safeCategories, budgetInputs]);

  const handleBudgetChange = (category, value) => {
    const newBudgetInputs = { ...budgetInputs, [category]: parseFloat(value || 0) };
    setBudgetInputs(newBudgetInputs);
  };

  const handleSaveBudgets = () => {
    const updatedBudget = safeCategories.map((category) => ({
      name: category,
      budget: budgetInputs[category] || 0,
      spent: currentSpending[category] || 0,
      status: currentSpending[category] > budgetInputs[category] ? "over budget" : "under budget"
    }));

    localStorage.setItem('budgetData', JSON.stringify(updatedBudget));

    onBudgetChange(updatedBudget);
  };

  
  
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginBottom: "150px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ color: "#333", textAlign: "center" }}>Set Your Budget</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {safeCategories.map((category, index) => (
          <div
            key={category}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "30px",
            //   border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <label
              style={{
                marginRight: "5px",
                fontSize: "16px",
                whiteSpace: "nowrap",
              }}
            >
              {category} Budget:
            </label>
            <input
              type="number"
              value={budgetInputs[category] || ""}
              onChange={(e) => handleBudgetChange(category, e.target.value)}
              placeholder="Set budget"
              style={{
                padding: "8px",
                fontSize: "14px",
                width: "80px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <div style={{ marginLeft: "10px", fontSize: "14px" }}>
              <p>Spent: ${-1 * currentSpending[category] || 0}</p>
              <p
                style={{
                  color:
                    budgetStatus[category] === "Over Budget" ? "red" : "green",
                }}
              >
                {budgetStatus[category] ||
                  'Set your budget and click "Save Budgets"'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleSaveBudgets}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Budgets
        </button>
      </div>
    </div>
  );
  
  

};

export default BudgetTracker;
