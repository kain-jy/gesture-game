import asyncio
import base64
import time
from random import randint

import httpx
from fastapi import APIRouter, BackgroundTasks

from connector.common.ai_models import ai_models
from connector.common.setting import settings
from connector.functions.ai_access import ai_access
from connector.functions.aws_s3 import get_latest_image, upload_image
from connector.functions.redis_client import redis_client
from connector.model.models import (
    ModelRequest,
    ModelResponse,
    SessionRequest,
    SessionResponse,
)

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    """
    Health check endpoint.
    """
    return {"status": "ok"}


async def generate_answer(item: SessionRequest) -> None:
    await asyncio.sleep(3)

    resp = {}
    token = ai_access.get_aceess_token()
    image = get_latest_image()

    if image is None:
        print("No image found in S3")
        redis_client.set_session_status(item.session_id, True)
        return

    upload_image(item.session_id, image)
    encoded_image = base64.b64encode(image).decode("utf-8")

    async with httpx.AsyncClient() as client:
        tasks = {}
        for k, v in ai_models.items():
            tasks[k] = client.post(
                f"{settings.AGENT_HOST}/invocations",
                json={
                    "theme": item.theme,
                    "image": f"{encoded_image}",
                    "model": v,
                },
                headers={"Authorization": f"Bearer {token}"},
                timeout=None,
            )

        results = await asyncio.gather(*tasks.values())

        for model, response in zip(tasks.keys(), results):
            if response.status_code != 200:
                print(f"Error calling model {model}: {response.text}")
                continue
            print(model, response.json())
            resp[model] = ModelResponse.model_validate(response.json())

    redis_client.set_model_data(item.session_id, resp)
    redis_client.set_session_status(item.session_id, True)


@router.post("/session")
def get_score(
    item: SessionRequest, background_tasks: BackgroundTasks
) -> SessionResponse:
    # item.session_id
    status = redis_client.get_session_status(item.session_id)

    if status is None:
        background_tasks.add_task(generate_answer, item)
        redis_client.set_session_status(item.session_id, False)
        redis_client.set_latest_session_id(item.session_id)
        return SessionResponse(
            status=False,
            message="initialize",
            data=None,
            image_url=f"https://d23qucqh8l03a5.cloudfront.net/{item.session_id}.png",
        )
    elif not status:
        return SessionResponse(
            status=False,
            message="waiting",
            data=None,
            image_url=f"https://d23qucqh8l03a5.cloudfront.net/{item.session_id}.png",
        )
    else:
        # status is True
        return SessionResponse(
            status=True,
            message="success",
            data=redis_client.get_model_data(item.session_id),
            image_url=f"https://d23qucqh8l03a5.cloudfront.net/{item.session_id}.png",
        )


@router.get("/result")
def get_result() -> SessionResponse:
    # item.session_id
    current_session = redis_client.get_latest_session_id()

    if current_session is None:
        return SessionResponse(
            status=False,
            message="no session found",
            data=None,
            image_url="",
        )
    else:
        result = redis_client.get_model_data(current_session)

        if not result:
            return SessionResponse(
                status=False,
                message="no result found",
                data=None,
                image_url=f"https://d23qucqh8l03a5.cloudfront.net/{current_session}.png",
            )
        return SessionResponse(
            status=True,
            message="success",
            data=result,
            image_url=f"https://d23qucqh8l03a5.cloudfront.net/{current_session}.png",
        )


@router.post("/invocations")
def create_invocation(item: ModelRequest) -> ModelResponse:
    print("call create_invocation")
    time.sleep(randint(1, 3))
    return ModelResponse(
        reason=f"{item.model} model invoked with theme {item.theme}",
        score=randint(0, 100),
    )
