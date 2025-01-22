import requests
from datetime import datetime

jenkins_url = 'http://localhost:8080'
api_token = '11ef0fb45fb270116c808d45a4f6c5b7c0'
# api_token = '11ecccd366fbe0b1d12b9ab0eecacb994b'

def get_jenkins_last_build(job_name):
    url = f'{jenkins_url}/job/{job_name}/lastBuild/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    return response.json()

def get_jenkins_last_build_result(job_name):
    url = f'{jenkins_url}/job/{job_name}/lastBuild/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    
    if response.status_code == 404:
        return {"result": "NOT_BUILT", "timestamp": None}  # Default status with no timestamp
    elif response.status_code == 200:
        job_data = response.json()
        result = job_data.get('result', 'UNKNOWN')
        timestamp = job_data.get('timestamp', None)
        
        if timestamp:
            # Convert the timestamp from milliseconds to a human-readable format
            timestamp = datetime.utcfromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S')
        
        return {"result": result, "timestamp": timestamp}
    else:
        return {"result": "ERROR", "timestamp": None}  # If there was some other error

def get_last_build_results_in_folder(folder_name):
    # Get all jobs in the folder
    folder_url = f'{jenkins_url}/job/{folder_name}/api/json'
    folder_response = requests.get(folder_url, auth=('dvirlabs', api_token))
    
    if folder_response.status_code != 200:
        return {"error": f"Failed to fetch folder {folder_name}, status code {folder_response.status_code}"}
    
    folder_data = folder_response.json()
    jobs = folder_data.get("jobs", [])
    
    results = {}
    for job in jobs:
        job_name = job.get("name")
        if job_name:
            job_path = f"{folder_name}/job/{job_name}"
            result = get_jenkins_last_build_result(job_path)
            results[job_name] = result
    
    return results
