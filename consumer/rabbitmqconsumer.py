# import pika
# import threading
# from gg import generate_segments_and_master_playlist
# # Establishing connection parameters
# connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
# channel = connection.channel()

# # Declaring the queue
# channel.queue_declare(queue='video_quality_conversion_queue')
# def run_subprocess_and_ack(ch, delivery_tag, file_location, output_dir):
#     try:
#         # Run the ffmpeg subprocess
#         generate_segments_and_master_playlist(file_location, output_dir=output_dir) 
#         # Acknowledge the message if the subprocess succeeds
#         ch.basic_ack(delivery_tag=delivery_tag)
#     except Exception as e:
#         # Handle subprocess errors (logging, retrying, etc.)
#         print(f"Subprocess failed: {e}")
#         # Optionally, you can reject the message and requeue it
#         ch.basic_nack(delivery_tag=delivery_tag, requeue=True)

# # Callback function to handle incoming messages
# def callback(ch, method, properties, body):
#     # Process the message
#     print("Received:", body.decode())
#     print(method.delivery_tag)
#     # Simulate processing time
#     # Replace this with your actual processing logic
#     import json
#     data = json.loads(body)
#     file_location = data['file_path']
#     output_dir = data['output_dir']
   
#     thread = threading.Thread(target=run_subprocess_and_ack, args=(ch, method.delivery_tag, file_location, output_dir))
#     thread.start()

#     while thread.is_alive():
#         connection.process_data_events()
#         import time
#         time.sleep(10)
    
#     # ch.basic_ack(delivery_tag=method.delivery_tag)
#     # Acknowledge the message to remove it from the queue

# # Registering the callback function to consume messages
# channel.basic_consume(queue='video_quality_conversion_queue', on_message_callback=callback)

# # Start consuming messages
# print('Waiting for messages...')
# channel.start_consuming()


import pika
from utils  import generate_segments_and_master_playlist
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
client = MongoClient(os.getenv("MONGO_URL"), 27017)
files_collection = client['uploads']['files']
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    import json
    data = json.loads(body)
    file_location = data['file_path']
    output_dir = data['output_dir']
    file_id = data['file_id']
    status = generate_segments_and_master_playlist(file_location, output_dir=output_dir)
    if status:
        ch.basic_ack(delivery_tag=method.delivery_tag)
        resutlt = files_collection.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_converted": True}})
        print(f" [x] Updated {resutlt.modified_count} document")
        print(" [x] Done")
    else:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True) 

connection = pika.BlockingConnection(
            pika.ConnectionParameters( host= os.getenv("RABBITMQ_URL"),heartbeat=0,credentials=pika.PlainCredentials(username=os.getenv("RABBITMQ_DEFAULT_USER"), password=os.getenv("RABBITMQ_DEFAULT_PASS"))))
channel = connection.channel()
channel.queue_declare(queue='video_quality_conversion_queue')
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='video_quality_conversion_queue', on_message_callback=callback)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

