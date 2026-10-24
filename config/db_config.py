from multiprocessing import pool

from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import Integer, String, Text
from typing import List

# ===================== 1. 数据库连接配置（改这里的账号密码库名）=====================
# mysql+asyncmy 异步驱动；news 就是你刚才新建的数据库
ASYNC_DATABASE_URL = "mysql+aiomysql://root:000000@127.0.0.1:3306/news_app?charset=utf8mb4"

# 创建异步引擎
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
)

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 把session交给路由，路由里叫db
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()











