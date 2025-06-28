from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
import shutil
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.staticfiles import StaticFiles
from bson.objectid import ObjectId
from datetime import datetime
import uuid
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import boto3
from botocore.config import Config

load_dotenv()
UPLOAD_DIRECTORY = Path("uploads")
UPLOAD_DIRECTORY.mkdir(exist_ok=True)

HLSDIRECTORY = Path("hls")
HLSDIRECTORY.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.mount("/media", StaticFiles(directory="uploads"), name="media")
app.mount("/hls", StaticFiles(directory="hls"), name="hls")

ORIGINAL_VIDEO_DIRECTORY_NAME = "original"
HLS_VIDEO_DIRECTORY_NAME = "hls"

MONGO_DETAILS = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.uploads
files_collection = database.get_collection("files")

s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT_URL"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    config=Config(signature_version="s3v4"),
    region_name="auto",
)



class GenerateURLRequest(BaseModel):
    filename: str
    mime_type: str

@app.post("/generate-presigned-url/")
def generate_presigned_url(data: GenerateURLRequest):
    unique_filename = f"{uuid.uuid4()}_{data.filename}"
    try:
        url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": os.getenv("R2_BUCKET_NAME"),
                "Key": f"{ORIGINAL_VIDEO_DIRECTORY_NAME}/{unique_filename}",
                "ContentType": data.mime_type
                },
            ExpiresIn=os.getenv("PRESIGNED_URL_EXPIRE_TIME") 
        )
        return {
            "presigned_url": url,
            "path": unique_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class UploadCompleteRequest(BaseModel):
    filename: str
    mime_type: str
    unique_filename: str
    size: int | None = None

@app.post("/upload/complete/")
async def create_upload_file(data: UploadCompleteRequest):
    try:
        file_metadata = {
            "original_filename": data.filename,
            "unique_filename": data.unique_filename,
            "content_type": data.mime_type,
            "file_size": data.size,
            "is_converted": False,
            "upload_time": datetime.now(),
        }
        
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=os.getenv("RABBITMQ_URL"),
                heartbeat=0,
                credentials=pika.PlainCredentials(
                    username=os.getenv("RABBITMQ_DEFAULT_USER"),
                    password=os.getenv("RABBITMQ_DEFAULT_PASS"),
                ),
            )
        )
        channel = connection.channel()
        channel.queue_declare(queue="video_quality_conversion_queue")


        result = await files_collection.insert_one(
            file_metadata
        )


        queue_body = {
            "file_path": f"{ORIGINAL_VIDEO_DIRECTORY_NAME}/{data.unique_filename}",
            "output_dir": f"{HLS_VIDEO_DIRECTORY_NAME}/{data.unique_filename.split('.')[0]}",
            "file_id": str(result.inserted_id),
        }

        message = json.dumps(queue_body)

        channel.basic_publish(
            exchange="",
            routing_key="video_quality_conversion_queue",
            body=message,
        )
        channel.close()
        connection.close()

        return {
            "file_id": str(result.inserted_id),
            "unique_filename": data.unique_filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/files/all")
async def get_all_files():
    files = []
    instances = files_collection.find({"is_converted": True}, {"_id": 0}).sort(
        "upload_time", -1
    )
    async for file in instances:
        files.append(
            {
                # "file_id": str(file["_id"]),
                "original_filename": file["original_filename"],
                "unique_filename": file["unique_filename"],
                "content_type": file["content_type"],
                "file_size": str(file["file_size"]),
                "upload_time": file["upload_time"].isoformat(),
                "file_path": file["file_path"],
                "url": "http://localhost:8000/media/" + file["unique_filename"],
                "hls_url": "http://localhost:8000/hls/"
                + file["unique_filename"].split(".")[0]
                + "/master.m3u8",
            }
        )
    return files


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
