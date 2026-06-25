import os, asyncio, asyncpg
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg", "postgresql")

async def run():
    conn = await asyncpg.connect(url)
    sql = open("migrations/0004_reviews.sql").read()
    await conn.execute(sql)
    await conn.close()
    print("Migration applied successfully.")

asyncio.run(run())
