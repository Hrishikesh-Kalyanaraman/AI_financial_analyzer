from flask import Flask, request, jsonify, send_file
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import io
from fpdf import FPDF
import openpyxl
import matplotlib.pyplot as plt
import seaborn as sns
import os

app = Flask(__name__)

# Load or initialize the model and vectorizer
try:
    model = joblib.load('expense_categorizer.pkl')
    vectorizer = joblib.load('vectorizer.pkl')
except:
    model, vectorizer = None, None

budgets = {}
expense_summary = None

def preprocess_data(df):
    """
    Preprocess the CSV data and extract relevant features.
    For simplicity, we'll assume there are columns like 'Description' and 'Amount'.
    """
    df['Description'] = df['Description'].astype(str)
    df['Amount'] = df['Amount'].astype(float)
    return df[['Description', 'Amount']]

def train_model():
    data = {
        'Description': ['grocery shopping', 'electric bill', 'restaurant', 'salary', 'gym membership'],
        'Amount': [120, 60, 45, 2000, 40],
        'Category': ['Groceries', 'Utilities', 'Food', 'Income', 'Health']
    }
    
    df = pd.DataFrame(data)

    X = df['Description']
    y = df['Category']
    
    vectorizer = TfidfVectorizer()
    X_transformed = vectorizer.fit_transform(X)

    clf = RandomForestClassifier()
    clf.fit(X_transformed, y)
    
    joblib.dump(clf, 'expense_categorizer.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')
    
    return clf, vectorizer

if model is None or vectorizer is None:
    model, vectorizer = train_model()

@app.route('/')
def hello():
    return "AI Financial Analyzer Backend"

@app.route('/set_budget', methods=['POST'])
def set_budget():
    data = request.json
    category = data.get('category')
    amount = data.get('amount')

    if not category or amount is None:
        return jsonify({"error": "Invalid data. Category and amount are required."}), 400
    
    budgets[category] = amount
    return jsonify({"message": f"Budget set successfully for {category}: ${amount:.2f}"}), 200

@app.route('/reset_budgets', methods=['POST'])
def reset_budgets():
    budgets.clear()
    return jsonify({"message": "All budgets have been reset."}), 200

@app.route('/get_budgets', methods=['GET'])
def get_budgets():
    return jsonify(budgets), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    global expense_summary

    if 'file' not in request.files:
        return jsonify({"error": "No file part provided."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400
    if file and file.filename.endswith('.csv'):
        df = pd.read_csv(file)
        df = preprocess_data(df)
        
        descriptions = df['Description']
        X_transformed = vectorizer.transform(descriptions)
        predictions = model.predict(X_transformed)
        df['Category'] = predictions
        
        expense_summary = df.groupby('Category')['Amount'].sum().reset_index()
        categorized_expenses = df.to_dict(orient='records')
        
        # Check budget alerts
        alerts = []
        for category, spent in df.groupby('Category')['Amount'].sum().items():
            if category in budgets:
                percentage = (spent / budgets[category]) * 100
                if spent > budgets[category]:
                    alerts.append(f"Budget exceeded for {category}: Spent ${spent:.2f}, Budget ${budgets[category]:.2f} ({percentage:.1f}% of budget)")
        
        return jsonify({"expenses": categorized_expenses, "alerts": alerts}), 200
    
    return jsonify({"error": "Invalid file type. Only CSV files are accepted."}), 400

@app.route('/expense_insights', methods=['GET'])
def expense_insights():
    if not budgets:
        return jsonify({"error": "No budgets set. Please add budgets first."}), 400

    if expense_summary is None:
        return jsonify({"error": "No expense data uploaded yet."}), 400

    insights = {category: {"budget": budget, "spent": 0} for category, budget in budgets.items()}
    for _, row in expense_summary.iterrows():
        category = row['Category']
        spent = row['Amount']
        if category in insights:
            insights[category]["spent"] = spent
    
    for category, data in insights.items():
        data["remaining"] = data["budget"] - data["spent"]
        data["percentage_spent"] = (data["spent"] / data["budget"]) * 100 if data["budget"] > 0 else 0

    return jsonify(insights), 200

@app.route('/export/pdf', methods=['GET'])
def export_pdf():
    if expense_summary is None:
        return jsonify({"error": "No expense data available to export."}), 400

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Budget Report", ln=True, align='C')

    for _, row in expense_summary.iterrows():
        pdf.cell(200, 10, txt=f"{row['Category']}: ${row['Amount']:.2f}", ln=True, align='L')

    output = io.BytesIO()
    pdf.output(output)
    output.seek(0)
    return send_file(output, as_attachment=True, download_name="expense_summary.pdf")

@app.route('/export/excel', methods=['GET'])
def export_excel():
    if expense_summary is None:
        return jsonify({"error": "No expense data available to export."}), 400

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        expense_summary.to_excel(writer, index=False, sheet_name='Expenses')
        budgets_df = pd.DataFrame(budgets.items(), columns=['Category', 'Budget'])
        budgets_df.to_excel(writer, index=False, sheet_name='Budgets')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name="expense_summary.xlsx")

@app.route('/visualize', methods=['GET'])
def visualize_expenses():
    if expense_summary is None:
        return jsonify({"error": "No expense data available for visualization."}), 400

    output = io.BytesIO()
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Category', y='Amount', data=expense_summary)
    plt.title('Expense Summary by Category')
    plt.xlabel('Category')
    plt.ylabel('Amount')
    plt.tight_layout()
    plt.savefig(output, format='png')
    output.seek(0)
    return send_file(output, mimetype='image/png', as_attachment=True, download_name="expense_visualization.png")

if __name__ == '__main__':
    # Ensure directories for storing models and visualizations exist
    os.makedirs(os.path.dirname('models/'), exist_ok=True)
    app.run(debug=True)
