# Re-export the main application from api.main
# This ensures all database models, history endpoints (/history), stats (/stats),
# and analytics (/analytics) are available regardless of whether you start with
# 'uvicorn api.main:app' or 'uvicorn backend.main:app'

from api.main import app

__all__ = ["app"]