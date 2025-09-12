import os
from dotenv import load_dotenv

def load_env():
    env = os.getenv("ENV", "development")
    env_file = f".env.{env}" if env != "development" else ".env"
    load_dotenv(env_file)
