from flask import Flask, request, jsonify, send_file
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import io
from fpdf import FPDF
import openpyxl

app = Flask(__name__)

try:
    model = joblib.load('expense_categorizer.pkl')
except:
    model = None

budgets = {}

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

if model is None:
    model, vectorizer = train_model()

@app.route('/')
def hello():
    return "AI Financial Analyzer Backend"

@app.route('/set_budget', methods=['POST'])
def set_budget():
    data = request.json
    category = data['category']
    amount = data['amount']
    budgets[category] = amount
    return jsonify({"message": "Budget set successfully"}), 200

@app.route('/get_budgets', methods=['GET'])
def get_budgets():
    return jsonify(budgets), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file and file.filename.endswith('.csv'):
        df = pd.read_csv(file)
        df = preprocess_data(df)
        
        descriptions = df['Description']
        X_transformed = vectorizer.transform(descriptions)
        predictions = model.predict(X_transformed)
        df['Category'] = predictions
        
        categorized_expenses = df.to_dict(orient='records')
        
        # Check budget alerts
        alerts = []
        for category, spent in df.groupby('Category')['Amount'].sum().items():
            if category in budgets and spent > budgets[category]:
                alerts.append(f"Budget exceeded for {category}: Spent ${spent:.2f}, Budget ${budgets[category]:.2f}")
        
        return jsonify({"expenses": categorized_expenses, "alerts": alerts}), 200
    
    return 'Invalid file type', 400

@app.route('/export/pdf', methods=['GET'])
def export_pdf():
    df = pd.DataFrame(budgets.items(), columns=['Category', 'Budget'])
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Budget Report", ln=True, align='C')

    for idx, row in df.iterrows():
        pdf.cell(200, 10, txt=f"{row['Category']}: ${row['Budget']}", ln=True, align='L')
    
    output = io.BytesIO()
    pdf.output(output)
    output.seek(0)
    return send_file(output, as_attachment=True, download_name="budget_report.pdf")

@app.route('/export/excel', methods=['GET'])
def export_excel():
    df = pd.DataFrame(budgets.items(), columns=['Category', 'Budget'])
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Budget')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name="budget_report.xlsx")

if __name__ == '__main__':
    app.run(debug=True)
