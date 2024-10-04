from flask import Flask, request
import pandas as pd

app = Flask(__name__)

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
        # Process the dataframe
        return 'File uploaded successfully', 200
    return 'Invalid file type', 400

if __name__ == '__main__':
    app.run(debug=True)