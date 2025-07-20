from redis import Redis

from connector.common.setting import settings
from connector.model.models import ModelResponse


class RedisClient:
    def __init__(self) -> None:
        self.client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
            ssl=True,
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

    def set_latest_session_id(self, session_id: str) -> None:
        """
        Set the latest session ID in Redis.
        """
        self.client.set("latest_session_id", session_id)

    def get_latest_session_id(self) -> str | None:
        """
        Get the latest session ID from Redis.
        """
        return self.client.get("latest_session_id")

    def get_model_data(self, session_id: str) -> dict[str, ModelResponse] | None:
        """
        Get model data for a session from Redis.
        """
        resp = self.client.hgetall(session_id)

        if resp is None:
            return None

        return {k: ModelResponse.model_validate_json(v) for k, v in resp.items()}

    def set_model_data(self, session_id: str, data: dict[str, ModelResponse]) -> None:
        """
        Set model data for a session in Redis.
        """

        self.client.hmset(session_id, {k: v.model_dump_json() for k, v in data.items()})


redis_client = RedisClient()
