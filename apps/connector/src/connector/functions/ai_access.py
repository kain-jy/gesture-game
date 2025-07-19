import requests
from connector.common.setting import settings
from connector.model.models import ModelRequest, ModelResponse


class AI_ACCESS:
    def __init__(self) -> None:
        response = requests.post(
            settings.AUTHORIZE_HOST,
            data={
                "client_id": settings.CLIENT_ID,
                "client_secret": settings.CLIENT_SECRET,
                "grant_type": settings.GRANT_TYPE,
                "scope": settings.SCOPE,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        ).json()

        self.access_token = response.get("access_token")

    def call_agent(self, data: ModelRequest) -> ModelResponse:
        """
        Call the agent with the given endpoint and data.
        """

        # print(type(data.model_dump()), data.model_dump())

        response = requests.post(
            f"{settings.AGENT_HOST}/invocations",
            json=data.model_dump(),
            # headers={"Authorization": f"Bearer {self.access_token}"},
        ).json()

        return ModelResponse.model_validate(response)


ai_access = AI_ACCESS()
