# VANET ML Service

Accident severity classification microservice for the VANET Accident Detection System.  
Deployed at **https://vanet-ml-service.onrender.com**

---

## What it does

Receives 11 sensor features from the CMS backend and classifies each accident as **CRITICAL**, **MAJOR**, or **MINOR** with a confidence score.

```
CMS Backend  ──POST /predict──►  FastAPI  ──►  Random Forest  ──►  { severity, confidence }
```

---

## Tech stack

| Layer | Technology |
|---|---|
| API framework | FastAPI 0.110.0 |
| ML model | scikit-learn 1.4.0 — Random Forest (300 trees) |
| Preprocessing | StandardScaler (fitted on training data) |
| Serialisation | joblib 1.3.2 |
| Runtime | Python 3.10+ |
| Deployment | Render.com (free tier) |

---

## Project structure

```
ml/
├── app.py                  ← FastAPI application, /predict and /health endpoints
├── model.py                ← AccidentModel class — loads model.pkl, runs inference
├── feature_schema.py       ← FEATURE_ORDER list, SEVERITY_MAP dict
├── train.py                ← Training script — GridSearchCV, evaluation, saves model.pkl
├── generate_dataset.py     ← Synthetic dataset generator — outputs dataset.csv
├── model.pkl               ← Trained pipeline (StandardScaler + RandomForest)
├── dataset.csv             ← 5000-record synthetic training dataset
├── requirements.txt        ← Pinned dependencies
├── Procfile                ← Render start command
└── render.yaml             ← Render deployment config
```

---

## API endpoints

### `GET /health`

Render.com health check. Returns 200 when the service is running.

```bash
curl https://vanet-ml-service.onrender.com/health
```

```json
{ "status": "ok" }
```

---

### `POST /predict`

Classify accident severity from OBU sensor features.

```bash
curl -X POST https://vanet-ml-service.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "acc_delta":            18.5,
    "gyro_delta":           320.1,
    "vibration_intensity":  1.0,
    "impact_duration":      850.0,
    "airbag_deployed":      1,
    "wheel_speed_drop_pct": 72.5,
    "thermal_c":            34.2,
    "latitude":             19.0760,
    "longitude":            72.8777,
    "initial_speed":        65.0,
    "imu_consistency":      0.62
  }'
```

**Response:**

```json
{
  "severity":   "CRITICAL",
  "confidence": 0.9467
}
```

---

## Feature schema

The 11 input features map directly from OBU EAM field names:

| ML feature name | OBU field | Unit | Description |
|---|---|---|---|
| `acc_delta` | `acc` | m/s² | Kalman-fused acceleration (MPU6050×0.7 + MPU9250×0.3) |
| `gyro_delta` | `gyro` | deg/s | Angular velocity from MPU9250 gyroscope |
| `vibration_intensity` | `vib` | 0 or 1 | SW-420 vibration sensor (binary) |
| `impact_duration` | `idur` | ms | Time above acceleration threshold |
| `airbag_deployed` | `abag` | 0 or 1 | CAN bus airbag signal via MCP2515 |
| `wheel_speed_drop_pct` | `wdrop` | % | Wheel speed drop from OBD2 PID 0x0D |
| `thermal_c` | `temp` | °C | Temperature from DS18B20 |
| `latitude` | `lat` | degrees | GPS latitude from NEO-6M |
| `longitude` | `lon` | degrees | GPS longitude from NEO-6M |
| `initial_speed` | `spd` | km/h | Vehicle speed at time of impact |
| `imu_consistency` | `cons` | m/s² | \|MPU6050 − MPU9250\| disagreement score |

**Field `imu_consistency` is optional** — defaults to `0.0` if not provided (backward compatible with older OBU firmware).

---

## Severity classes

| Class | Condition |
|---|---|
| **CRITICAL** | `airbag=1` OR `acc > 25 m/s²` OR (`gyro > 300 deg/s` AND `wdrop > 60%`) |
| **MAJOR** | `acc > 12 m/s²` OR (`gyro > 200` AND `wdrop > 30%`) OR (`acc > 8` AND `vib = 1`) |
| **MINOR** | All other events below MAJOR threshold |

---

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/vanetprojectbe/ml.git
cd ml
pip install -r requirements.txt
```

### 2. Generate dataset (if dataset.csv is missing)

```bash
python generate_dataset.py
# Output: dataset.csv  (5000 records)
```

### 3. Train the model (if model.pkl is missing)

```bash
python train.py
# Output: model.pkl
# Prints accuracy, classification report, confusion matrix, feature importances
```

Training runs GridSearchCV with 5-fold cross-validation across 72 hyperparameter combinations. On a modern CPU this takes approximately 3–5 minutes.

### 4. Start the API server

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Model details

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Number of trees | 300 |
| Max depth | 15 |
| Max features | sqrt |
| Class weighting | balanced (handles class imbalance) |
| CV scoring | f1_macro |
| Preprocessing | StandardScaler (zero mean, unit variance) |
| Training set | 4000 records (80%) |
| Test set | 1000 records (20%) |
| **F1-macro (test set)** | **0.903** |

### Performance by class

| Class | Precision | Recall | F1 |
|---|---|---|---|
| MINOR | 0.91 | 0.94 | 0.93 |
| MAJOR | 0.89 | 0.86 | 0.87 |
| CRITICAL | 0.91 | 0.92 | 0.92 |
| **Macro avg** | **0.90** | **0.91** | **0.903** |

Zero MINOR→CRITICAL misclassifications on the test set.

---

## Dataset

`dataset.csv` contains 5,000 synthetic records calibrated to Indian road accident data:

| Field | Range | Distribution |
|---|---|---|
| acc_delta | 0–35 m/s² | Uniform |
| gyro_delta | 0–400 deg/s | Uniform |
| vibration_intensity | 0 / 1 | Bernoulli |
| impact_duration | 0–2000 ms | Uniform |
| airbag_deployed | 0 / 1 | Bernoulli (15% prior) |
| wheel_speed_drop_pct | 0–100% | Uniform |
| thermal_c | 20–90°C | Uniform |
| latitude | 8–37°N | Uniform (India bounding box) |
| longitude | 68–97°E | Uniform (India bounding box) |
| initial_speed | 0–120 km/h | Uniform |
| imu_consistency | 0–8 m/s² | Uniform |

Regenerate with `python generate_dataset.py`. Retrain with `python train.py` after regenerating.

---

## Deploy to Render

The repo includes `Procfile` and `render.yaml` for one-click Render deployment.

1. Fork this repo or push to your own GitHub account
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect the repo
4. Render detects `render.yaml` automatically — click **Apply**
5. Wait for build to complete (~3 minutes)

**Environment:** No environment variables required — the model runs fully self-contained.

**Cold start note:** Render free tier spins down after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds while the service wakes up. The CMS backend uses a 30-second timeout on ML calls to handle this.

---

## Keep the service warm (optional)

To avoid cold-start delays in production, ping the health endpoint every 10 minutes using a free cron service (e.g. cron-job.org):

```
URL:      https://vanet-ml-service.onrender.com/health
Interval: every 10 minutes
Method:   GET
```

---

## CMS integration

The CMS backend (`accident_routes.js`) calls this service automatically on every incoming EAM from the RSU. The field mapping from OBU names to ML names happens in the CMS — you do not need to change anything in this service when OBU firmware is updated.

```javascript
// CMS maps OBU fields → ML feature names before calling /predict
const mlFeatures = {
  acc_delta:            body.acc,
  gyro_delta:           body.gyro,
  vibration_intensity:  body.vib,
  impact_duration:      body.idur,
  airbag_deployed:      body.abag,
  wheel_speed_drop_pct: body.wdrop,
  thermal_c:            body.temp,
  latitude:             body.lat,
  longitude:            body.lon,
  initial_speed:        body.spd,
  imu_consistency:      body.cons
};
```

---

## Requirements

```
fastapi==0.110.0
uvicorn==0.27.1
scikit-learn==1.4.0
numpy==1.26.4
pandas==2.2.0
joblib==1.3.2
pydantic==2.6.1
```

All versions are pinned to prevent breaking changes from upstream updates.

---

## Part of the VANET system

| Component | Repository |
|---|---|
| OBU firmware (STM32) | github.com/vanetprojectbe/OBU |
| RSU firmware (ESP32) | github.com/vanetprojectbe/RSU |
| CMS Backend (Node.js) | github.com/vanetprojectbe/CMS-backend |
| CMS Frontend (React) | github.com/vanetprojectbe/CMS-frontend |
| **ML Service (Python)** | **github.com/vanetprojectbe/ml** |
