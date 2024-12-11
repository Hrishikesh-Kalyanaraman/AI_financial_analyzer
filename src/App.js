import React, { useState } from 'react';
import './App.css';
import BudgetTracker from './components/BudgetTracker';
import FileUpload from './components/FileUpload';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const API_KEY = ""
// const API_KEY = "";

function App() {
  const [budget, setBudget] = useState([
    { name: "Groceries", budget: 500, spent: 0, status: "under budget" },
    { name: "Entertainment", budget: 200, spent: 0, status: "under budget" },
    { name: "Utilities", budget: 150, spent: 0, status: "under budget" },
    { name: "Rent", budget: 1200, spent: 0, status: "under budget" },
    { name: "Transportation", budget: 100, spent: 0, status: "under budget" },
    { name: "Miscellaneous", budget: 50, spent: 0, status: "under budget" },
  ]);

  // Update the budget with expenses from CSV
  const updateBudget = (transactions) => {
    const categorySpending = {};

    // Calculate total spending per category
    transactions.forEach((transaction) => {
      if (transaction.type === "Expense") {
        if (categorySpending[transaction.category]) {
          categorySpending[transaction.category] += transaction.amount;
        } else {
          categorySpending[transaction.category] = transaction.amount;
        }
      }
    });

    // Update the budget state with the calculated spending
    setBudget((prevBudget) => {
      return prevBudget.map((category) => {
        const spentAmount = categorySpending[category.name] || 0;
        return {
          ...category,
          spent: spentAmount,
          status: spentAmount <= category.budget ? "under budget" : "over budget", // Update status
        };
      });
    });
  };

  // Handle data received from FileUpload
  const handleFileData = (fileData) => {
    updateBudget(fileData); // Call updateBudget with parsed file data
  };

  // Prepare data for the bar chart
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
            message: "Hello I am ChatGPT",
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
    // const API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
      <h1>Financial Tracker</h1>
      <FileUpload onFileData={handleFileData} /> {/* Pass handleFileData as a prop */}

      {/* Render the bar chart */}
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




    <div className="container">
      <div className="response-area">
                {messages.map((message, index) => {
                    return(
                        <div className={message.sender==="ChatGPT" ? 'gpt-message message' : 'user-message message'}>{message.message}</div>
                    );
                })}
            </div>
      <div className="prompt-area">
        <input type="text" placeholder="Send a message..." value={input} onChange={handleChange}/>
        <button className="submit" type="submit" onClick={handleSend}>Send</button>
      </div>
		</div>
      
    </div>
  );
}

export default App;