import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

uri = os.getenv("MONGODB_URI")

print(f"Connecting to: {uri}")

try:
    client = MongoClient(uri)
    client.admin.command('ping')
    print("MongoDB connection successful!")
except Exception as e:
    print("MongoDB connection failed:", e)
