from http import HTTPStatus
from pydoc import describe

from fastapi import APIRouter, HTTPException  # 导入APIRouter类，用于创建路由
from fastapi import Depends, Query
from sqlalchemy import null
from sqlalchemy.ext.asyncio.session import AsyncSession

from config.db_config import get_db
from crud import news

'''创建API实例'''
router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("/categories")
async def get_categories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    categories = await news.get_category(db, skip, limit)

    return {
        "code": 200,
        "message": "获取新闻分类成功",
        "data": categories,

    }


@router.get("/list")
async def get_news_list(
        category_id: int = Query(..., description="分类ID", alias="categoryId"),
        page: int = Query(1, description="页码", alias="page"),
        page_size: int = Query(10, description="每页数量", alias="pageSize", le=100),  # 每页数量   最大100
        db: AsyncSession = Depends(get_db)
):
    news_list = await news.get_news_list(db, category_id, (page - 1) * page_size, page_size)
    total = await news.get_news_count(db, category_id)
    hasMore = total > (page - 1) * page_size + page_size
    return {
        "code": 200,
        "message": "获取新闻列表成功",
        "total": total,
        "data": {
            # "list":[
            #     {
            #         "id":1,
            #         "category":null,
            #         "title":"新闻标题",
            #         "content":"新闻内容",
            #         "description":"新闻描述",
            #
            #     }
            # ],
            "list": news_list,
            "hasMore": hasMore
        }
    }


@router.get("/detail")
async def get_news_detail(
        news_id: int = Query(..., description="新闻ID", alias="id"),
        db: AsyncSession = Depends(get_db)
):

    news_detail = await news.get_news_detail(db, news_id)
    if not news_detail:
        raise HTTPException(status_code=404, detail="新闻不存在")

    view_count= await news.update_news_view_count(db, news_id)
    if not view_count:
        raise HTTPException(status_code=404, detail="增加浏览量失败")

    related_news = await news.get_other_category_news(db, news_id)
    return {
        "code": 200,
        "message": "获取新闻详情成功",
        "data": {
            "id": news_detail.id,
            "title": news_detail.title,
            "content": news_detail.content,
            "image": news_detail.image,
            "author": news_detail.author,
            "publicTime": news_detail.publish_time,
            "category_id": news_detail.category_id,
            "views": news_detail.views,
            "relatedNews": related_news
        }
    }
