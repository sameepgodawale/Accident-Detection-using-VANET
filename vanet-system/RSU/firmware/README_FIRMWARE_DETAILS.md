# Firmware Details & AT Command Sequences

This firmware uses SIM800L's HTTP AT command flow to POST JSON payloads to the CMS.
Sequence (simplified):
1. AT+SAPBR=3,1,"CONTYPE","GPRS"
2. AT+SAPBR=3,1,"APN","<apn>"
3. AT+SAPBR=1,1
4. AT+HTTPINIT
5. AT+HTTPPARA="URL","<url>"
6. AT+HTTPDATA=<len>,<timeout>
7. <send payload bytes>
8. AT+HTTPACTION=1
9. AT+HTTPREAD (optional)
10. AT+HTTPTERM

Error handling:
- If AT+SAPBR=1,1 fails, retry with backoff, attempt power cycle.
- If HTTPACTION returns non-2xx or times out, queue the payload for retry and continue.

Notes:
- Always ensure SIM800L has registered to GPRS network: AT+CGATT? and AT+CREG?
- Use SIM800L SMS commands for OTA if needed (not implemented here).
