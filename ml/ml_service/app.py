from fastapi import FastAPI
from pydantic import BaseModel
from ml_service.model import AccidentModel

app = FastAPI()

model = AccidentModel()

class AccidentInput(BaseModel):
    acc_delta: float
    gyro_delta: float
    vibration_intensity: float
    impact_duration: float
    airbag_deployed: int
    wheel_speed_drop_pct: float
    thermal_c: float
    latitude: float
    longitude: float
    initial_speed: float


@app.get("/")
def health():
    return {"status": "ML service running"}


@app.post("/predict")
def predict(data: AccidentInput):
    result = model.predict(data.dict())
    return result
