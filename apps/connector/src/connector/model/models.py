from pydantic import BaseModel, Field


# model="amazon.nova-pro-v1:0" theme="C" image=$(base64 -i ./note/C.png)
class ModelRequest(BaseModel):
    model: str
    theme: str
    image: str = Field(..., description="Base64 encoded image data")


class ModelResponse(BaseModel):
    reason: str
    score: int


class SessionRequest(BaseModel):
    session_id: str
    theme: str


class SessionResponse(BaseModel):
    status: bool
    message: str
    data: dict[str, ModelResponse] | None
