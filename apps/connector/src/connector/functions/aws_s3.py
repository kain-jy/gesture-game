import base64
import io
import tempfile

import boto3
from PIL import Image

from connector.common.setting import settings


def get_latest_image() -> bytes | None:
    s3 = boto3.client("s3")
    bucket = s3.list_objects_v2(
        Bucket=settings.S3_BUCKET,
    )

    key: str | None = None
    lastmodified: str | None = None

    for obj in bucket.get("Contents", []):
        if obj["Key"].endswith("/latest.jpg"):
            if lastmodified is None or obj["LastModified"] > lastmodified:
                key = obj["Key"]
                lastmodified = obj["LastModified"]

    if key:
        file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        file2 = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        print(file.name)
        with open(file.name, "wb") as f:
            s3.download_fileobj(Bucket=settings.S3_BUCKET, Key=key, Fileobj=f)

        img = Image.open(file.name)
        img.save(file2.name, format="PNG")

        with open(file2.name, "rb") as f:
            return f.read()

    return None


def upload_image(session_id: str, image: bytes) -> None:
    s3 = boto3.client("s3")
    # bucket = settings.S3_BUCKET

    # Upload the image to S3
    s3.upload_fileobj(
        Fileobj=io.BytesIO(image),
        Bucket="guesture-game-image",
        Key=f"{session_id}.png",
        ExtraArgs={"ContentType": "image/png"},
    )
