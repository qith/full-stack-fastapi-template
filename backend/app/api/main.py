from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils
from app.api.routes.rbac import router as rbac_router
from app.api.routes.projects import router as projects_router
from app.api.routes.product_dict import router as product_dict_router
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(rbac_router)
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(product_dict_router, prefix="/product-dict", tags=["product-dict"])


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
