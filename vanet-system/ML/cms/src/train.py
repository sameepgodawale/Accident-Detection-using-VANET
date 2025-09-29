#!/usr/bin/env python3
import argparse, glob, os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
from utils import load_and_clean, preprocess

parser = argparse.ArgumentParser()
parser.add_argument('--data_dir', default='../data')
parser.add_argument('--out', default='../model')
args = parser.parse_args()

# Collect CSVs
csvs = glob.glob(os.path.join(args.data_dir, 'raw','*.csv'))
if not csvs:
    print('No CSVs found in', os.path.join(args.data_dir, 'raw'))
    print('Please place labeled CSVs there with features and severity column (Minor/Major/Critical).')
    exit(1)

df = load_and_clean(csvs)
X, y, scaler = preprocess(df)
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42)

clf = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
clf.fit(X_train, y_train)

# Save
os.makedirs(args.out, exist_ok=True)
joblib.dump(clf, os.path.join(args.out, 'severity_model.pkl'))
joblib.dump(scaler, os.path.join(args.out, 'scaler.pkl'))

print('Training complete. Model and scaler saved to', args.out)
