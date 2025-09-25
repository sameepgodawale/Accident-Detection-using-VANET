# RSU Deployment & Maintenance

- Mount RSU in weatherproof enclosure with external antennas
- Provide stable 12V input and fuse protection
- Monitor /var/log/rsu_gateway.log for errors
- Periodic tasks: upload logs, rotate queue DB, replace SIM card when needed

Provisioning:
- Each RSU should have unique RSU_ID and API key provisioned in a secure vault or via USB key provisioning tool
