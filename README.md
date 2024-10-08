# Frame Extractor with Flask, Celery, Redis, and Next.js

This project is designed to extract video frames using a Python backend (Flask, Celery) and display the results in a React (Next.js) frontend. Redis is used as a message broker for Celery tasks.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v16.x or later) and **npm** (v7.x or later)
- **Python 3.10+**
- **Redis** (for task/message queue)
- **Celery** (for managing background tasks)
- **FFmpeg** (for video frame extraction)
- **Concurrently** (to run multiple scripts simultaneously)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/DatTranDev/FrameExtractor
cd FrameExtractor
```

### 2. Install Dependencies

#### Node.js Dependencies

Install the dependencies using npm:

```bash
npm install
npm install -g pnpm
```

This will install all the necessary Node.js libraries including React, Next.js, and Concurrently.

### 3. Install Redis

Redis must be installed and running for Celery to function properly.

- **On macOS**: Install via Homebrew
  ```bash
  brew install redis
  ```
  Start Redis:
  ```bash
  brew services start redis
  ```

- **On Ubuntu**:
  ```bash
  sudo apt-get install redis-server
  sudo systemctl start redis
  ```

- **On Windows**: Download Redis for Windows from [here](https://github.com/microsoftarchive/redis/releases) and follow the installation instructions.

### 4. FFmpeg Installation

FFmpeg is required to extract frames from videos. Download FFmpeg from [here](https://ffmpeg.org/download.html) and ensure it is added to your system's PATH.

### 5. Start the Redis Server

Ensure Redis is running on the default port:

```bash
redis-server
```

### 6. Run the Application

From the root directory, run the following command:

```bash
npm run dev
```

Visit `http://localhost:3000` to interact with the frontend application.

### 7. API Endpoints

- `POST /api/python`: Triggers video processing and returns a `task_id`.
- `GET /api/task-status/<task_id>`: Get the status of the background task using the `task_id`.

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.

