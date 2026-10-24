
from fastapi import FastAPI
from routers import news


from fastapi.middleware.cors import CORSMiddleware





app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 允许所有来源的请求 开发时使用    # 允许所有来源的请求 生产环境不建议使用
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

'''挂载路由/注册路由'''
app.include_router(news.router)
