import React, { useState } from 'react';
import './App.css';
import BudgetTracker from './components/BudgetTracker';
import FileUpload from './components/FileUpload';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_KEY = "";

function App() {
  const [budget, setBudget] = useState([
    { name: "Groceries", budget: 500, spent: 0, status: "under budget" },
    { name: "Entertainment", budget: 200, spent: 0, status: "under budget" },
    { name: "Utilities", budget: 150, spent: 0, status: "under budget" },
    { name: "Rent", budget: 1200, spent: 0, status: "under budget" },
    { name: "Transportation", budget: 100, spent: 0, status: "under budget" },
    { name: "Miscellaneous", budget: 50, spent: 0, status: "under budget" },
  ]);

  const updateBudget = (transactions) => {
    const categorySpending = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "Expense") {
        if (categorySpending[transaction.category]) {
          categorySpending[transaction.category] += transaction.amount;
        } else {
          categorySpending[transaction.category] = transaction.amount;
        }
      }
    });

    setBudget((prevBudget) => {
      return prevBudget.map((category) => {
        const spentAmount = categorySpending[category.name] || 0;
        return {
          ...category,
          spent: spentAmount,
          status: spentAmount <= category.budget ? "under budget" : "over budget",
        };
      });
    });
  };

  const handleFileData = (fileData) => {
    updateBudget(fileData);
  };

  const chartData = {
    labels: budget.map((category) => category.name),
    datasets: [
      {
        label: 'Expenses by Category',
        data: budget.map((category) => -1*category.spent),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            message: "Hello, I am your financial assistant, how can I help you today?",
            sender: "ChatGPT"
        }
    ]);

    const handleChange = (event)=>{
      setInput(event.target.value)
  }

  const handleSend = async (event)=>{
      event.preventDefault()
      const newMessage = {
          message: input,
          sender: "user"
      }

      const newMessages = [...messages,newMessage];

      setMessages(newMessages);

      setInput('');

      await processMessageToChatGPT(newMessages);
  }


  async function processMessageToChatGPT(chatMessages){
    let apiMessages = chatMessages.map((messageObject)=>{
        let role="";
        if(messageObject.sender === "ChatGPT"){
            role = "assistant"
        }else{
            role = "user"
        }
        return (
            {role: role, content: messageObject.message}
        )
    });

    const systemMessage = {
        role: "system",
        content: "Explain all concept like i am 10 year old"
    }

    const apiRequestBody = {
        "model": "gpt-4o-mini",
        "messages": [
            systemMessage,
            ...apiMessages
        ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",{
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data.choices[0].message.content);
        if (data.choices && data.choices[0]) {

        setMessages(
            [
                ...chatMessages,
                {
                    message: data.choices[0].message.content,
                    sender: "ChatGPT"
                }
            ]
        )
          } else {
            console.error("Unexpected API response structure:", data);
          }
      
    }).catch((error) => console.error("Error fetching data:", error));

}

  return (
    <div className="App">
      <h1>Financial Tracking Assistant</h1>
      <FileUpload onFileData={handleFileData} />

      <div style={{ width: '50%', margin: '20px auto' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <BudgetTracker
        categories={budget.map((category) => category.name)}
        onBudgetChange={(newBudgets) => setBudget(newBudgets)}
        currentSpending={budget.reduce((spending, category) => {
          spending[category.name] = category.spent;
          return spending;
        }, {})}
        budgets={budget.reduce((budgets, category) => {
          budgets[category.name] = category.budget;
          return budgets;
        }, {})}
      />



<div
  className="chat-overlay"
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    zIndex: 1000,
  }}
>
  <div
    className="response-area"
    style={{
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '12px 12px 0 0',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
    }}
  >
    {messages.map((message, index) => (
      <div
        key={index}
        className={message.sender === "ChatGPT" ? 'gpt-message message' : 'user-message message'}
        style={{
          margin: '10px 0',
          padding: '10px',
          borderRadius: '8px',
          color: message.sender === "ChatGPT" ? '#fff' : '#000',
          backgroundColor: message.sender === "ChatGPT" ? '#007bff' : '#e1e1e1',
          textAlign: message.sender === "ChatGPT" ? 'left' : 'right',
          maxWidth: '80%',
          alignSelf: message.sender === "ChatGPT" ? 'flex-start' : 'flex-end',
        }}
      >
        {message.message}
      </div>
    ))}
  </div>
  <div
    className="prompt-area"
    style={{
      display: 'flex',
      padding: '10px',
      gap: '10px',
      borderTop: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
      borderRadius: '0 0 12px 12px',
    }}
  >
    <input
      type="text"
      placeholder="Send a message..."
      value={input}
      onChange={handleChange}
      style={{
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        outline: 'none',
        fontSize: '14px',
      }}
    />
    <button
      className="submit"
      type="submit"
      onClick={handleSend}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'background-color 0.3s ease',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
      onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
    >
      Send
    </button>
  </div>
</div>

      
    </div>
  );
}

export default App;