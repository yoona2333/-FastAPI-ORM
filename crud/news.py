from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from models.news import Category, News

'''查询所有新闻分类'''
async def get_category(db: AsyncSession, skip: int = 0, limit: int = 100):
    # select() 返回的是语句对象，不能 await；只有 db.execute() 才是异步的
    stmt = select(Category).order_by(Category.sort_order).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()



'''查询指定分类下的所有新闻'''
async def get_news_list(db: AsyncSession, category_id: int, skip: int = 0, limit: int = 10):
    stmt = select(News).where(News.category_id == category_id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


'''查询指定分类下的新闻数量'''
async def get_news_count(db: AsyncSession, category_id: int):
    stmt = select(func.count(News.id)).where(News.category_id == category_id)
    result = await db.execute(stmt)
    return result.scalar_one()


'''查询指定新闻的详情'''
async def get_news_detail(db: AsyncSession, news_id: int):
    stmt = select(News).where(News.id == news_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


"""增加浏览量"""
async def update_news_view_count(db: AsyncSession, news_id: int):
    stmt = update(News).where(News.id == news_id).values(views=News.views + 1)
    result=await db.execute(stmt)
    await db.commit()
    return result.rowcount>0

'''获取其他分类下的推荐新闻 '''
async def get_other_category_news(db: AsyncSession, category_id: int, news_id: int = 0, limit: int = 5):
    stmt = select(News).where(
        News.category_id == category_id, News.id != news_id
    ).order_by(
        News.views.desc(),
        News.publish_time.desc()
    ).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
