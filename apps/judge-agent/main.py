import json
from base64 import b64decode

from strands import Agent
from strands.models import BedrockModel
from bedrock_agentcore.runtime import BedrockAgentCoreApp


app = BedrockAgentCoreApp()

SYSTEM_PROMPT = """
あなたはジェスチャーの審査員です。与えられた画像とお題を評価し、お題にそったポーズをとっているか審査してください。審査結果は0から100の間で表現してください。出力は必ず以下のJSONフォーマットに従ってください。

{
  "score": 0,
  "reason": ""
}
"""


@app.entrypoint
async def agent_invocation(payload):
    model = payload.get("model")
    theme = payload.get("theme")
    image = payload.get("image")

    agent = Agent(
        model=BedrockModel(
            model_id=model,
            # model_id="amazon.nova-pro-v1:0",
            # model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
            temperature=0,
        ),
        system_prompt=SYSTEM_PROMPT
    )

    result = agent([
        {"text": f"お題: 「{theme}」"},
        {"image": {
            "source": {"bytes": b64decode(image)},
            "format": "png"
        }}
    ])

    return json.loads(result.message["content"][0]["text"])


if __name__ == "__main__":
    app.run()
