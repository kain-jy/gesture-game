import base64
import io
import tempfile

import boto3

from connector.common.setting import settings


def get_latest_image() -> str:
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
        buf = io.BytesIO()
        file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        print(file.name)
        with open(file.name, "wb") as f:
            s3.download_fileobj(Bucket=settings.S3_BUCKET, Key=key, Fileobj=f)
        with open(file.name, "rb") as f:
            b64str = base64.b64encode(f.read()).decode("utf-8")

        # buf.seek(0)
        # b64str = base64.b64encode(buf.read()).decode("utf-8")

        return f"{b64str}"

    return ""
