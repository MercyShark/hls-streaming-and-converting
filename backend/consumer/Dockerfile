# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Install dependencies
RUN apt-get update &&  apt-get update --fix-missing && apt-get install -y ffmpeg

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Command to run the application
CMD ["python", "rabbitmqconsumer.py"]
