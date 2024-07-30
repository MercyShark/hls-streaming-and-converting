import subprocess
import threading
import os

def run_ffmpeg_command(command):
    """Run a command using subprocess."""
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")

def create_hls_streams(input_file, output_dir):
    resolutions = {
        '240p': {'scale': '426:240', 'bitrate': '400k', 'maxrate': '450k', 'bufsize': '800k', 'audio_bitrate': '96k'},
        '480p': {'scale': '854:480', 'bitrate': '800k', 'maxrate': '856k', 'bufsize': '1200k', 'audio_bitrate': '128k'},
        '720p': {'scale': '1280:720', 'bitrate': '2500k', 'maxrate': '2675k', 'bufsize': '3750k', 'audio_bitrate': '128k'},
        '1080p': {'scale': '1920:1080', 'bitrate': '5000k', 'maxrate': '5350k', 'bufsize': '7500k', 'audio_bitrate': '192k'},
    }

    for res, params in resolutions.items():
        output_path = os.path.join(output_dir, res + "_%03d.ts")
        command = (
            f'ffmpeg -i {input_file} -vf "scale={params["scale"]}" -c:a aac -ar 48000 '
            f'-c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 '
            f'-hls_time 5 -hls_playlist_type vod -b:v {params["bitrate"]} '
            f'-maxrate {params["maxrate"]} -bufsize {params["bufsize"]} -b:a {params["audio_bitrate"]} '
            f'-hls_segment_filename "{output_path}" {os.path.join(output_dir, res)}.m3u8'
        )
        run_ffmpeg_command(command)
        # thread = threading.Thread(target=run_ffmpeg_command, args=(command,))
        # thread.start()

def create_master_playlist(output_dir):
    master_playlist_content = (
        "#EXTM3U\n"
        "#EXT-X-VERSION:3\n"
        "#EXT-X-STREAM-INF:BANDWIDTH=533000,RESOLUTION=426x240\n240p.m3u8\n"
        "#EXT-X-STREAM-INF:BANDWIDTH=1348000,RESOLUTION=854x480\n480p.m3u8\n"
        "#EXT-X-STREAM-INF:BANDWIDTH=2675000,RESOLUTION=1280x720\n720p.m3u8\n"
        "#EXT-X-STREAM-INF:BANDWIDTH=5350000,RESOLUTION=1920x1080\n1080p.m3u8\n"
    )

    with open(os.path.join(output_dir, 'master.m3u8'), 'w') as f:
        f.write(master_playlist_content)

def generate_segments_and_master_playlist(input_file : str, output_dir : str):
    # input_file = 'input_video.mp4'  # Replace with your input file
    # movie_name = os.path.splitext(os.path.basename(input_file))[0]
    # output_dir = os.path.join('hls', movie_name)

    # Create directory for movie if it doesn't exist
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        create_hls_streams(input_file, output_dir)
        create_master_playlist(output_dir)
        print(f"HLS segments and master playlist created successfully in {output_dir}.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

# if __name__ == "__main__":
#     main()
