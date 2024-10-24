from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

app = Flask(__name__)

try:
    model = joblib.load('expense_categorizer.pkl')
except:
    model = None

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
        return jsonify(categorized_expenses), 200
    
    return 'Invalid file type', 400

if __name__ == '__main__':
    app.run(debug=True)