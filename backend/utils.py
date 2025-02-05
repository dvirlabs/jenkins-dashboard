import requests
from datetime import datetime
from dotenv import load_dotenv
import os
import logging

# טוען משתני סביבה
load_dotenv()
logging.basicConfig(level=logging.INFO)

# משתני חיבור ל-Jenkins
jenkins_url = os.getenv("JENKINS_URL")
jenkins_username = os.getenv("JENKINS_USERNAME")
api_token = os.getenv("API_KEY")

# פונקציה לשליפת נתוני ה-build האחרון
def get_jenkins_last_build_result(job_name):
    job_path = "/job/".join(job_name.split("/"))  # תיקון נתיב למקרה של תיקיות
    url = f"{jenkins_url}/job/{job_path}/lastBuild/api/json"

    response = requests.get(url, auth=(jenkins_username, api_token))
    logging.info(f"Fetching last build for: {job_name} (URL: {url})")

    if response.status_code == 404:
        return {"result": "NOT_BUILT", "timestamp": None, "build_url": None}
    elif response.status_code == 200:
        job_data = response.json()
        result = job_data.get("result", "UNKNOWN")
        timestamp = job_data.get("timestamp", None)
        build_url = job_data.get("url")

        if timestamp:
            timestamp = datetime.utcfromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S')

        return {"result": result, "timestamp": timestamp, "build_url": build_url}
    else:
        logging.error(f"Error fetching last build for {job_name}: {response.status_code}")
        return {"result": "ERROR", "timestamp": None, "build_url": None}

# פונקציה לשליפת כל ה-Jobs בתיקייה
def get_last_build_results_in_folder(folder_name):
    folder_url = f"{jenkins_url}/job/{folder_name}/api/json"
    response = requests.get(folder_url, auth=(jenkins_username, api_token))

    if response.status_code != 200:
        logging.error(f"Failed to fetch folder {folder_name}: {response.status_code}")
        return {"error": f"Failed to fetch folder {folder_name}, status code {response.status_code}"}

    folder_data = response.json()
    jobs = folder_data.get("jobs", [])
    
    results = {}
    for job in jobs:
        job_name = job.get("name")
        if job_name:
            job_path = f"{folder_name}/{job_name}"
            results[job_name] = get_jenkins_last_build_result(job_path)

    return results

# פונקציה להפעלת Job ב-Jenkins
def trigger_jenkins_build(job_name):
    # מוודא שהנתיב כולל את `my-apps`
    if not job_name.startswith("my-apps/"):
        job_name = f"my-apps/{job_name}"

    job_path = "/job/".join(job_name.split("/"))  
    url = f"{jenkins_url}/job/{job_path}/build"

    logging.info(f"Job name received: {job_name}")
    logging.info(f"Formatted job path: {job_path}")
    logging.info(f"Final request URL: {url}")

    # אם ה-Jenkins דורש CSRF Protection, מביאים את ה-crumb
    crumb_url = f"{jenkins_url}/crumbIssuer/api/json"
    crumb_response = requests.get(crumb_url, auth=(jenkins_username, api_token))

    headers = {}
    if crumb_response.status_code == 200:
        crumb_data = crumb_response.json()
        headers[crumb_data["crumbRequestField"]] = crumb_data["crumb"]

    response = requests.post(url, auth=(jenkins_username, api_token), headers=headers)

    logging.info(f"Response status: {response.status_code}")
    logging.info(f"Response text: {response.text}")

    if response.status_code in [200, 201]:
        return {"status": "success", "message": f"Job {job_name} triggered successfully"}
    else:
        return {
            "status": "error",
            "message": f"Failed to trigger job {job_name}",
            "status_code": response.status_code,
            "response_text": response.text
        }

