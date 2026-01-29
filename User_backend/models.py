from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

# User DB
users_db = client["User_db"]
users = users_db["users"]

# Inventory DB
inventory_db = client["inventory_db"]
specimen_containers = inventory_db["specimen_containers"]

# Order DB
order_db = client["order_db"]
orders = order_db["orders"]
