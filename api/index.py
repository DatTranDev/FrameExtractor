import os
import pandas as pd
import subprocess
from natsort import natsorted
from glob import glob
from tqdm.auto import tqdm
from flask import Flask, jsonify, request
from celery import Celery
import time

app = Flask(__name__)

# Configure Celery with Redis as the broker
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['result_backend'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)
celery.conf.broker_connection_retry_on_startup = True
########################################################################
@celery.task(name="api.index.process_videos", bind=True)
def process_videos(self, query):
    AIC_videos_path = 'C:/Users/DAT/Downloads/VideoData'
    AIC_keyframes_path = 'C:/Users/DAT/Downloads/KeyframeData'

    if not os.path.exists(AIC_keyframes_path):
        os.mkdir(AIC_keyframes_path)
    
    lst_videos = ["Videos_L05", "Videos_L06"]
    count_video = 0
    count_keyframe = 0

    for i in range(len(lst_videos)):
        videos_path = os.path.join(AIC_videos_path, lst_videos[i], "video")
        video_name = lst_videos[i].split("_")[-1]
        videos_id_lst = natsorted(os.listdir(videos_path))
        keyframes_video_path = os.path.join(AIC_keyframes_path, f'Keyframes_{video_name}')
        
        if not os.path.exists(keyframes_video_path):
            os.mkdir(keyframes_video_path)

        for vid_id in tqdm(videos_id_lst):
            video_id_path = os.path.join(videos_path, vid_id)
            id = vid_id.split(".")[0]
            keyframes_video_id_path = os.path.join(keyframes_video_path, id)

            if not os.path.exists(keyframes_video_id_path):
                os.mkdir(keyframes_video_id_path)

            # Extract keyframes
            frame_dist = 100
            filter = "select='not(mod(n,100))',setpts=N/FRAME_RATE/TB"
            terminal_cmd = f'C:/Users/DAT/Downloads/ffmpeg/ffmpeg.exe -i {video_id_path} -vf {filter} -vsync vfr {keyframes_video_id_path}/{id}_%d.jpg'
            
            subprocess.run(terminal_cmd, shell=True)
    image_data = [
    {
        "url": f"https://via.placeholder.com/250x180?text=Image+{index + 1}",
        "title": f"Image {index + 1}"
    }
    for index in range(100)
    ]

    return image_data
####api end points
@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'response': 'pong!'})

@app.route('/api/python', methods=['POST'])
def run_task():
    data = request.get_json()
    query = data.get('query')
    # Start the background task
    task = process_videos.apply_async(args=[query])

    return jsonify({'task_id': task.id}), 202  # 202 Accepted: task has been accepted and is being processed

@app.route('/api/task-status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    task = process_videos.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'status': task.info,  # task.info contains the return value from the task
        }
        if task.state == 'SUCCESS':
            response['status'] = 'Completed!'
            response['result'] = task.info  # Include the result in the response
    else:
        # Something went wrong in the background job
        response = {
            'state': task.state,
            'status': str(task.info), 
        }

    return jsonify(response)