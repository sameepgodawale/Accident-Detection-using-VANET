# QA & Field Testing Plan
- Unit tests: sensor drivers (IMU, GPS, CAN) using recorded trace files
- Integration tests: event detection -> persistent storage -> transmit -> RSU ack
- Environmental tests: vibration, temperature (-20C to 70C), EMC
- Field pilot: deploy 20 OBUs, 3 RSUs, collect labeled incidents

Acceptance metrics:
- Event persistence durability: >=99.5% survive power cycle
- Delivery rate (critical events): >=95% within 60s in urban density
- False-positive rate: <=2% after ML/rules tuning
