import requests

jenkins_url = 'http://192.168.10.105:8080'
api_token = '11ecccd366fbe0b1d12b9ab0eecacb994b'

def get_jenkins_jobs():
    url = f'{jenkins_url}/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    return response.json()

def get_jenkins_job(job_name):
    url = f'{jenkins_url}/job/{job_name}/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    return response.json()

def get_jenkins_last_build(job_name):
    url = f'{jenkins_url}/job/{job_name}/lastBuild/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    return response.json()

def get_jenkins_last_build_result(job_name):
    url = f'{jenkins_url}/job/{job_name}/lastBuild/api/json'
    response = requests.get(url, auth=('dvirlabs', api_token))
    
    if response.status_code == 404:
        return "NOT_BUILT"  # Return a default status if job has never run or doesn't exist
    elif response.status_code == 200:
        job_data = response.json()
        return job_data.get('result', 'UNKNOWN')  # Return the job result or 'UNKNOWN' if result is not present
    else:
        return "ERROR"  # If there was some other error, return 'ERROR'
    
def get_last_build_results_in_folder(folder_name):
    # Get all jobs in the folder
    folder_url = f'{jenkins_url}/job/{folder_name}/api/json'
    folder_response = requests.get(folder_url, auth=('dvirlabs', api_token))
    
    if folder_response.status_code != 200:
        return {"error": f"Failed to fetch folder {folder_name}, status code {folder_response.status_code}"}
    
    folder_data = folder_response.json()
    jobs = folder_data.get("jobs", [])
    
    # Extract the last build result for each job
    results = {}
    for job in jobs:
        job_name = job.get("name")
        if job_name:
            # Properly format the job path with additional /job/ segments
            job_path = f"{folder_name}/job/{job_name}"
            result = get_jenkins_last_build_result(job_path)
            results[job_name] = result
    
    return results
