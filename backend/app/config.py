from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    jwt_secret: str = "super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    openrouter_api_key: str = ""
    site_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
