import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("VT_API_KEY")

print("API KEY FOUND:", bool(API_KEY))

headers = {
    "x-apikey": API_KEY
}

response = requests.get(
    "https://www.virustotal.com/api/v3/users/current",
    headers=headers
)

print("Status Code:", response.status_code)
print(response.text)