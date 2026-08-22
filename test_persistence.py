import requests
import json

base = "http://127.0.0.1:8000"

print("=== 1. HEALTH CHECK ===")
h = requests.get(f"{base}/health")
print("Health:", h.json())

print("\n=== 2. CLEAR HISTORY ===")
c = requests.delete(f"{base}/history")
print("Cleared:", c.json())

print("\n=== 3. SCAN 1: https://google.com ===")
s1 = requests.post(f"{base}/analyze", json={"url": "https://google.com"}).json()
print("Scan 1 ID:", s1.get("scan_id"), "Verdict:", s1.get("final_verdict"), "Score:", s1.get("risk_score"))

print("\n=== 4. SCAN 2: http://paypal-security-login.com ===")
s2 = requests.post(f"{base}/analyze", json={"url": "http://paypal-security-login.com"}).json()
print("Scan 2 ID:", s2.get("scan_id"), "Verdict:", s2.get("final_verdict"), "Score:", s2.get("risk_score"))

print("\n=== 5. SCAN 3: http://update-banking-details.xyz/secure/update ===")
s3 = requests.post(f"{base}/analyze", json={"url": "http://update-banking-details.xyz/secure/update"}).json()
print("Scan 3 ID:", s3.get("scan_id"), "Verdict:", s3.get("final_verdict"), "Score:", s3.get("risk_score"))

print("\n=== 6. GET /history ===")
hist = requests.get(f"{base}/history").json()
print("Total History Records Returned:", len(hist))
for r in hist:
    print(f"  [#{r['id']}] {r['verdict']} (Score: {r['risk_score']}) -> {r['url']}")

print("\n=== 7. GET /stats ===")
stats = requests.get(f"{base}/stats").json()
print("Stats:", json.dumps(stats, indent=2))

print("\n=== 8. GET /analytics ===")
analytics = requests.get(f"{base}/analytics").json()
print("Analytics:", json.dumps(analytics, indent=2))
