
import pika
from utils  import generate_segments_and_master_playlist
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import os
import boto3
from botocore.config import Config
import shutil
import redis
import json
r = redis.Redis(host='localhost', port=6379, decode_responses=True)


load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"), 27017)
files_collection = client['uploads']['files']


s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT_URL"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

def fetch_from_r2(bucket, key):
    response = s3_client.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    return content


def upload_to_r2(local_folder):

    if not os.path.isdir(local_folder):
        print(f"Directory does not exist: {local_folder}")
        return
    try:
        for root, _, files in os.walk(local_folder):
            for file in files:
                local_path = os.path.join(root, file)
                normalized_path = local_path.replace("\\", "/")
                s3_client.upload_file(normalized_path, os.getenv("R2_BUCKET_NAME"), normalized_path)

    except Exception as e:
        print(f"Error uploading files to R2: {e}")

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    import json
    data = json.loads(body)
    file_location = data['file_path']
    output_dir = data['output_dir']
    file_id = data['file_id']


    data = fetch_from_r2(bucket=os.getenv("R2_BUCKET_NAME"), key=file_location)
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, 'wb') as f:
        f.write(data)

    status = generate_segments_and_master_playlist(file_location, output_dir=output_dir)

    
    if status:
        upload_to_r2(output_dir)
        shutil.rmtree(os.path.dirname(output_dir))
        os.remove(file_location)
        result = files_collection.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_converted": True}})
        ch.basic_ack(delivery_tag=method.delivery_tag)
        hls_url = f"{os.getenv('HLS_BASE_URL')}/{output_dir}/master.m3u8"
        r.publish('notify', json.dumps({"type": "conversion_complete", "hls_url": hls_url, "file_id": str(file_id)}))
        print(f" [x] Updated {result.modified_count} document")
        print(" [x] Done")
    else:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True) 

connection = pika.BlockingConnection(
            pika.ConnectionParameters( host= os.getenv("RABBITMQ_URL"),heartbeat=0,credentials=pika.PlainCredentials(username=os.getenv("RABBITMQ_DEFAULT_USER"), password=os.getenv("RABBITMQ_DEFAULT_PASS"))))
channel = connection.channel()
channel.queue_declare(queue=os.getenv("RABBITMQ_QUEUE_NAME"))
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=os.getenv("RABBITMQ_QUEUE_NAME"), on_message_callback=callback)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

