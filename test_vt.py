from backend.analyzer.threat_intelligence.virustotal import scan_url

result = scan_url("https://google.com")

print(result)