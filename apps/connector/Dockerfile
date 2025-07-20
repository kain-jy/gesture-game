FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS req

WORKDIR /io

RUN --mount=type=bind,source=./pyproject.toml,target=/io/pyproject.toml \
    --mount=type=bind,source=./uv.lock,target=/io/uv.lock \
    uv export --no-dev --no-hashes --no-emit-project --output-file /requirements.txt

FROM python:3.12-slim-bookworm AS base

RUN --mount=type=bind,from=req,source=/requirements.txt,target=/requirements.txt \
    pip install --no-cache-dir -r /requirements.txt

FROM base AS app

WORKDIR /app
ENV PYTHONPATH="/app/src/"

COPY ./src /app/src

RUN --mount=type=bind,source=./pyproject.toml,target=/app/pyproject.toml \
    --mount=type=bind,source=./README.md,target=/app/README.md \
    pip install --no-cache-dir /app

CMD ["fastapi", "run", "/app/src/connector/main.py"]
EXPOSE 8000