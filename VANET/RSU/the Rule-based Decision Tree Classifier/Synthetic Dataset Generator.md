
It generates labeled accident samples (`Minor`, `Major`, `Critical`) with realistic sensor feature distributions, then writes them into a CSV file that you can use for testing the **rule-based classifier** or training a future ML model.

---

````markdown
# Synthetic Dataset Generator for VANET Accident Classifier

This script generates a synthetic dataset of accident events with features:
- `acc_delta` (g)
- `gyro_delta` (deg/s)
- `vibration` (unitless)
- `impact_time` (s)
- `airbag` (0/1)
- `wheel_drop_pct` (0..1 or -1 if missing)

Each row is labeled with the **expected severity**: `Minor`, `Major`, `Critical`.

---

## Usage

```bash
python generate_synthetic_dataset.py --samples 1000 --output synthetic_accidents.csv
````

---

## Python Script

```python
#!/usr/bin/env python3
"""
Synthetic Dataset Generator for Rule-Based Accident Classifier
Author: VANET Project Team

Generates a labeled CSV dataset of accident-like events using randomized values
to simulate Minor, Major, and Critical cases.
"""

import argparse
import csv
import random

def random_case():
    """Generate a random accident case with realistic feature ranges."""
    scenario = random.choice(["Minor", "Major", "Critical"])

    if scenario == "Minor":
        acc = round(random.uniform(0.2, 4.5), 2)
        gyro = round(random.uniform(0.0, 10.0), 2)
        vib = round(random.uniform(0.0, 0.8), 2)
        t = round(random.uniform(0.01, 0.2), 2)
        airbag = 0
        drop = -1.0

    elif scenario == "Major":
        acc = round(random.uniform(6.0, 9.5), 2)
        gyro = round(random.uniform(10.0, 40.0), 2)
        vib = round(random.uniform(0.8, 1.6), 2)
        t = round(random.uniform(0.2, 0.7), 2)
        airbag = 0
        drop = round(random.uniform(0.2, 0.6), 2)

    else:  # Critical
        acc = round(random.uniform(10.0, 16.0), 2)
        gyro = round(random.uniform(30.0, 120.0), 2)
        vib = round(random.uniform(1.2, 3.0), 2)
        t = round(random.uniform(0.2, 1.2), 2)
        airbag = random.choice([0, 1])
        drop = round(random.uniform(0.6, 1.0), 2)

    return {
        "acc_delta": acc,
        "gyro_delta": gyro,
        "vibration": vib,
        "impact_time": t,
        "airbag": airbag,
        "wheel_drop_pct": drop,
        "label": scenario
    }

def generate_dataset(n_samples, output_file):
    """Generate dataset and save to CSV."""
    fieldnames = ["acc_delta", "gyro_delta", "vibration", "impact_time", "airbag", "wheel_drop_pct", "label"]

    with open(output_file, mode="w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for _ in range(n_samples):
            row = random_case()
            writer.writerow(row)

    print(f"[INFO] Generated {n_samples} samples → {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthetic Dataset Generator for VANET Classifier")
    parser.add_argument("--samples", type=int, default=500, help="Number of samples to generate")
    parser.add_argument("--output", type=str, default="synthetic_accidents.csv", help="Output CSV filename")
    args = parser.parse_args()

    generate_dataset(args.samples, args.output)
```

---

## Example Output (`synthetic_accidents.csv`)

```csv
acc_delta,gyro_delta,vibration,impact_time,airbag,wheel_drop_pct,label
0.85,5.12,0.34,0.08,0,-1.0,Minor
7.21,22.8,1.14,0.45,0,0.42,Major
12.33,87.1,2.1,0.6,1,0.71,Critical
3.44,2.9,0.2,0.12,0,-1.0,Minor
```

---

✅ This dataset can be used to:

* Test the **rule-based classifier implementation**.
* Benchmark accuracy of thresholds.
* Train a decision tree / ML model in the future.

```
