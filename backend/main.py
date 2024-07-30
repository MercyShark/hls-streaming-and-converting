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
# Ensure the upload directory exists
UPLOAD_DIRECTORY = Path("uploads")
UPLOAD_DIRECTORY.mkdir(exist_ok=True)

HLSDIRECTORY = Path("hls")
HLSDIRECTORY.mkdir(exist_ok=True)

app = FastAPI()

# channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.mount("/media",StaticFiles(directory="uploads"),name="media")
app.mount("/hls",StaticFiles(directory="hls"),name="hls")
# MongoDB settings
# MONGO_DETAILS = "mongodb://localhost:27017" // development
MONGO_DETAILS = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.uploads
files_collection = database.get_collection("files")


def get_unique_filename(file_location: Path) -> Path:
    unique_id = uuid.uuid4().hex
    new_filename = f"{file_location.stem}_{unique_id}{file_location.suffix}"
    return file_location.parent / new_filename

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters( host= os.getenv("RABBITMQ_URL"),heartbeat=0,credentials=pika.PlainCredentials(username=os.getenv("RABBITMQ_DEFAULT_USER"), password=os.getenv("RABBITMQ_DEFAULT_PASS"))))
        channel = connection.channel()

        channel.queue_declare(queue='video_quality_conversion_queue')
        file_location : Path = UPLOAD_DIRECTORY / file.filename

        # Check if file already exists and generate a unique filename if it does
        if file_location.exists():
            file_location = get_unique_filename(file_location)

        # Save file to disk
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(file.filename)
        # Prepare metadata
        file_metadata = {
            "original_filename": file.filename,
            "unique_filename": file_location.name,
            "content_type": file.content_type,
            "file_size": file_location.stat().st_size,
            "upload_time": datetime.now(),
            "file_path": str(file_location),
            "is_converted": "False"
        }
        
        print(file_metadata)
        # Generate HLS segments and master playlist
        print(file_location)
        print(HLSDIRECTORY / file_location.stem)
        result = await files_collection.insert_one(file_metadata)
        body = {
            "file_path": str(file_location),
            "output_dir": str(HLSDIRECTORY / file_location.stem),
            "file_id": str(result.inserted_id),
        }
        message = json.dumps(body)
        channel.basic_publish(exchange='', routing_key='video_quality_conversion_queue', body=message)

        # Insert metadata into MongoDB
        channel.close()
        connection.close()
        return {"file_id": str(result.inserted_id), "unique_filename": file_location.name}
        # return {"unique_filename": file_location.name}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @app.get("/")
# async def main():
#     content = """
#     <body>
#     <form action="/uploadfile/" enctype="multipart/form-data" method="post">
#     <input name="file" type="file">
#     <input type="submit">
#     </form>
#     </body>
#     """
#     return HTMLResponse(content=content)

@app.get("/files/all")
async def get_all_files():
    files = []
    instances = files_collection.find({"is_converted" : True},{'_id': 0}).sort("upload_time",-1)
    async for file in instances:
        files.append({
            # "file_id": str(file["_id"]),
            "original_filename": file["original_filename"],
            "unique_filename": file["unique_filename"],
            "content_type": file["content_type"],
            "file_size": str(file["file_size"]),
            "upload_time": file["upload_time"].isoformat(),
            "file_path": file["file_path"],
            "url" : "http://localhost:8000/media/" + file['unique_filename'],
            "hls_url" : "http://localhost:8000/hls/" + file['unique_filename'].split('.')[0] + "/master.m3u8"
        })
    return files

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
