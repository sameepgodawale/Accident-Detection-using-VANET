#!/usr/bin/env python3
from flask import Flask, request, jsonify
import joblib, os
from utils import FEATURES

app = Flask(__name__)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'severity_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'scaler.pkl')

if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    raise SystemExit('Model or scaler not found. Train the model using src/train.py and place files into cms/model/')

print('Loading model from', MODEL_PATH)
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

@app.route('/classify', methods=['POST'])
def classify():
    data = request.json
    features = [ data.get(f, 0) for f in FEATURES ]
    import numpy as np
    X = np.array(features).reshape(1,-1)
    Xs = scaler.transform(X)
    pred = model.predict(Xs)[0]
    proba = model.predict_proba(Xs).tolist()[0]
    return jsonify({'severity': str(pred), 'probabilities': proba})

if __name__=='__main__':
    app.run(host='0.0.0.0', port=8080)
