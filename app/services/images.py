"""
Blob Storage から画像を取得するビジネスロジック。
"""
import os
import base64
from uuid import UUID
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from azure.storage.blob import BlobServiceClient


def get_images(item_id: UUID, category: Optional[str] = None) -> JSONResponse:
    """
    UUIDに対応したすべての写真をBlob Storageから取得する。
    画像ファイル名は 旧形式: {uuid}_{index}.jpg / 新形式: {category}/{uuid}_{index}.jpg
    """
    blob_connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "itemclothes")

    if not blob_connection_string:
        raise HTTPException(
            status_code=500,
            detail="Azure Storage connection string is not configured",
        )

    try:
        blob_service_client = BlobServiceClient.from_connection_string(
            blob_connection_string
        )
        container_client = blob_service_client.get_container_client(container_name)

        if category:
            prefix = f"{category}/{item_id}_"
        else:
            prefix = f"{item_id}_"
        blobs = container_client.list_blobs(name_starts_with=prefix)

        images = []
        for blob in blobs:
            if blob.name.endswith(".jpg"):
                blob_client = container_client.get_blob_client(blob.name)
                blob_data = blob_client.download_blob()
                image_bytes = blob_data.readall()
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                images.append(
                    {
                        "filename": blob.name,
                        "data": image_base64,
                        "size": len(image_bytes),
                    }
                )

        if not images:
            raise HTTPException(
                status_code=404,
                detail=f"No images found for UUID: {item_id}",
            )

        return JSONResponse(
            content={
                "uuid": str(item_id),
                "count": len(images),
                "images": images,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving images: {str(e)}"
        )
