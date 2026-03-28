import pandas as pd
import numpy as np

rows = 5000

data = []

for _ in range(rows):

    acc = np.random.uniform(1,30)
    gyro = np.random.uniform(0.5,8)
    vib = np.random.uniform(0,1)
    impact = np.random.uniform(0.01,0.3)
    airbag = np.random.choice([0,1])
    speed_drop = np.random.uniform(0,100)
    temp = np.random.uniform(25,120)
    lat = np.random.uniform(-90,90)
    lon = np.random.uniform(-180,180)
    speed = np.random.uniform(0,120)

    severity = 0

    if acc > 20 or airbag == 1:
        severity = 2
    elif acc > 10:
        severity = 1

    data.append([
        acc,gyro,vib,impact,airbag,
        speed_drop,temp,lat,lon,speed,severity
    ])

cols = [
'acc_delta','gyro_delta','vibration_intensity','impact_duration',
'airbag_deployed','wheel_speed_drop_pct','thermal_c',
'latitude','longitude','initial_speed','severity'
]

df = pd.DataFrame(data,columns=cols)
df.to_csv("dataset.csv",index=False)

print("Dataset generated.")
