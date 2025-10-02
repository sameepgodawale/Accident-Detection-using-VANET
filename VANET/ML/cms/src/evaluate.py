#!/usr/bin/env python3
import argparse, glob, os
from sklearn.metrics import classification_report
import joblib
from utils import load_and_clean, preprocess

parser = argparse.ArgumentParser()
parser.add_argument('--data_dir', default='../data')
parser.add_argument('--model', default='../model/severity_model.pkl')
args = parser.parse_args()

csvs = glob.glob(os.path.join(args.data_dir, 'raw','*.csv'))
if not csvs:
    print('No CSVs found for evaluation.')
    exit(1)

df = load_and_clean(csvs)
X,y,scaler = preprocess(df)
clf = joblib.load(args.model)

y_pred = clf.predict(X)
print(classification_report(y,y_pred))
