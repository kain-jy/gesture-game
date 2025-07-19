import time
from random import randint
from turtle import mode

import requests
from connector.common.ai_models import ai_models
from connector.common.setting import settings
from connector.functions.redis_client import redis_client
from connector.model.models import (
    ModelRequest,
    ModelResponse,
    SessionRequest,
    SessionResponse,
)
from fastapi import APIRouter, BackgroundTasks

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "agent_host": settings.AGENT_HOST}


def generate_answer(item: SessionRequest) -> None:
    print("call")

    result = {}

    for k, v in ai_models.items():
        model_request = ModelRequest(model=v, theme=item.theme, image="hello")

        resp = requests.post(
            f"{settings.AGENT_HOST}/invocations",
            json=model_request.dict(),
        )

        result[k] = ModelResponse(**resp.json())

    redis_client.set_model_data(item.session_id, result)
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
        return SessionResponse(status=False, message="initialize", data=None)
    elif not status:
        return SessionResponse(status=False, message="waiting", data=None)
    else:
        # status is True
        return SessionResponse(
            status=True,
            message="success",
            data=None,
        )


@router.post("/invocations")
def create_invocation(item: ModelRequest) -> ModelResponse:
    print("call create_invocation")
    time.sleep(randint(1, 3))
    return ModelResponse(
        reason=f"{item.model} model invoked with theme {item.theme}",
        score=randint(0, 100),
    )
