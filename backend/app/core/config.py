"""Application configuration."""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "KMC Fleet Management Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./kmc_fleet.db"

    # JWT
    SECRET_KEY: str = "kmc-fleet-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MQTT (for TBOX device communication)
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883

    # Gaode Map API
    GAODE_API_KEY: str = ""

    # File storage
    UPLOAD_DIR: str = "./uploads"
    VIDEO_DIR: str = "./uploads/videos"

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure directories exist
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.VIDEO_DIR).mkdir(parents=True, exist_ok=True)
