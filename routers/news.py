from fastapi import APIRouter  # 导入APIRouter类，用于创建路由
from fastapi import Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from config.db_config import get_db
from crud import news

'''创建API实例'''
router = APIRouter(prefix="/api/news",tags=["news"])

@router.get("/categories")
async def get_categories(skip:int =0,limit:int=100,db:AsyncSession = Depends(get_db)):

    categories = await news.get_category(db,skip,limit)

    return {
        "code":200,
        "message":"获取新闻分类成功",
        "data":categories,

    }




