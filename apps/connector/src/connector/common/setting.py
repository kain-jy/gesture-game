from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    AGENT_HOST: str = "http://0.0.0.0:8000"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    model_config = SettingsConfigDict(env_file=".env")  # , env_prefix="DLMNG_")


settings = Settings()
