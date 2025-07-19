import fastapi
from connector.api.router import router

app = fastapi.FastAPI()

app.include_router(router, prefix="")
