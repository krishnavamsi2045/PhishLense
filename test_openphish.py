from backend.analyzer.threat_intelligence.openphish import check_openphish

url = input("URL: ")

print(check_openphish(url))