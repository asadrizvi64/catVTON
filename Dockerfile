# Start from CUDA 11.8 with cuDNN 8 on Ubuntu 22.04
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python 3.10 and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Ensure 'python' command points to 'python3'
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1-mesa-glx \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Clone the CatVTON repository
RUN git clone https://github.com/Zheng-Chong/CatVTON.git

# Change directory to CatVTON
WORKDIR /app/CatVTON

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch with CUDA 11.8 support
# RUN pip install --no-cache-dir torch==2.0.1 torchvision==0.15.2 torchaudio==2.0.2 --index-url https://download.pytorch.org/whl/cu118
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install additional Python packages required by your Flask app
RUN pip install --no-cache-dir \
    flask \
    boto3 \
    requests

# Copy your Flask app code into the container
COPY app.py /app/CatVTON/

# Copy your Firebase service account key into the container (replace with your actual path)
# COPY path/to/your/firebase_service_account_key.json /app/CatVTON/

# Expose the port your app runs on
EXPOSE 5000

# Set the command to run your Flask app
CMD ["python", "api_app.py"]
