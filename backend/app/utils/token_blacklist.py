import redis
import os
from datetime import datetime

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.Redis.from_url(REDIS_URL)

class TokenBlacklist:
    def add(self, jti: str, exp_seconds: int):
        r.setex(jti, exp_seconds, 1)

    def contains(self, jti: str) -> bool:
        return r.exists(jti) == 1

blacklist = TokenBlacklist()
