import requests

from connector.common.setting import settings


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

    def get_aceess_token(self) -> str:
        """
        Get the access token.
        """
        return self.access_token

    # def call_agent(self, data: ModelRequest) -> ModelResponse:
    #     """
    #     Call the agent with the given endpoint and data.
    #     """

    #     response = httpx.post(
    #         f"{settings.AGENT_HOST}/invocations",
    #         json=data.model_dump(),
    #         headers={
    #             "Authorization": f"Bearer {self.access_token}",
    #             # "Content-Type": "application/x-www-form-urlencoded",
    #         },
    #         timeout=None,
    #     ).json()

    #     print(f"{response=}")

    #     return ModelResponse.model_validate(response)


ai_access = AI_ACCESS()
