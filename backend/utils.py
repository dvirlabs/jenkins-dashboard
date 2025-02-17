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
main_branch = os.getenv("MAIN_BRANCH")

# פונקציה לשליפת נתוני ה-build האחרון
def get_jenkins_last_build_result(job_path):
    """
    מקבלת שם Job ובודקת את הסטטוס של ה-main_branch.
    מחזירה את הסטטוס, את הזמן האחרון בפורמט קריא ואת ה-URL של ה-build האחרון.
    """
    job_url = f"{jenkins_url}/job/{job_path}/job/{main_branch}/lastBuild/api/json"
    
    # הדפסת ה-URL בפועל
    logging.debug(f"Fetching job URL: {job_url}")
    print(f"Fetching job URL: {job_url}")  # ניתן להחליף ל-logging.debug

    response = requests.get(job_url, auth=(jenkins_username, api_token))

    if response.status_code != 200:
        logging.error(f"Failed to fetch job {job_path}: {response.status_code}")
        return {"error": f"Failed to fetch job {job_path}, status code {response.status_code}"}

    build_data = response.json()
    timestamp = build_data.get("timestamp")

    # ממיר את ה-timestamp לפורמט קריא אם קיים
    human_readable_timestamp = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S') if timestamp else "UNKNOWN"

    return {
        "result": build_data.get("result", "UNKNOWN"),
        "timestamp": human_readable_timestamp,  # מחזיר את הזמן בפורמט קריא
        "build_url": build_data.get("url"),
    }

# פונקציה לשליפת כל ה-Jobs בתיקייה
def get_last_build_results_in_folder(folder_name):
    """
    מקבלת שם תיקייה (ארגון), שולפת את כל ה-Jobs בפנים, ובודקת את הסטטוס של ה-main_branch עבור כל Job.
    """
    folder_url = f"{jenkins_url}/job/{folder_name}/api/json"

    # הדפסת ה-URL של התיקייה
    logging.debug(f"Fetching folder URL: {folder_url}")
    print(f"Fetching folder URL: {folder_url}")  # אפשר להחליף ל-logging.debug

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
            job_path = f"{folder_name}/job/{job_name}"
            results[job_name] = get_jenkins_last_build_result(job_path)

    return results

# פונקציה להפעלת Job ב-Jenkins
def trigger_jenkins_build(folder_name, job_name):
    """
    מפעיל Job ב-Jenkins בתוך התיקייה שנשלחה בבקשה.
    """
    job_path = f"{folder_name}/job/{job_name}"
    url = f"{jenkins_url}/job/{job_path}/build"

    logging.info(f"Triggering job: {job_name} in folder: {folder_name}")
    logging.info(f"Final request URL: {url}")

    # מביא את ה-CSRF Crumb אם נדרש
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
        return {"status": "success", "message": f"Job {job_name} triggered successfully in {folder_name}"}
    else:
        return {
            "status": "error",
            "message": f"Failed to trigger job {job_name} in {folder_name}",
            "status_code": response.status_code,
            "response_text": response.text
        }


