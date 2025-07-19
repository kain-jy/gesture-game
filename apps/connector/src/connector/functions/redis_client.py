from connector.common.setting import settings
from connector.model.models import ModelResponse
from redis import Redis


class RedisClient:
    def __init__(self) -> None:
        self.client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
        )

    def get_session_status(self, session_id: str) -> bool | None:
        """
        Check if a session exists in Redis.
        """
        resp = self.client.get(f"{session_id}_status")

        if resp is None:
            return None

        return resp != "0"

    def set_session_status(self, session_id: str, status: bool) -> None:
        """
        Set the status of a session in Redis.
        """
        self.client.set(f"{session_id}_status", int(status))

    def get_model_data(self, session_id: str) -> dict[str, ModelResponse] | None:
        """
        Get model data for a session from Redis.
        """
        resp = self.client.hgetall(session_id)

        if resp is None:
            return None

        return {k: ModelResponse(**v) for k, v in resp.items()}

    def set_model_data(self, session_id: str, data: dict[str, ModelResponse]) -> None:
        """
        Set model data for a session in Redis.
        """
        for k, v in data.items():
            # Store each model response in a hash
            self.client.hset(session_id, k, v.json())


redis_client = RedisClient()
