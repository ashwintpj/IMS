from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes import user_routes, order_routes, profile_routes

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="../User_frontend/static"), name="static")

# Include routers
app.include_router(user_routes.router, prefix="/user")
app.include_router(order_routes.router, prefix="/user")
app.include_router(profile_routes.router, prefix="/user")
