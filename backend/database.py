import os
from motor.motor_asyncio import AsyncIOMotorClient

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(os.environ["MONGO_URI"])

async def close_db():
    global client
    if client:
        client.close()

async def get_db():
    return client["interviewcoach"]