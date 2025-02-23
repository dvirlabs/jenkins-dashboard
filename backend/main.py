import uvicorn
import os
import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.registry import CollectorRegistry
from utils import *

# יצירת רישום מותאם אישית כדי למנוע כפילות
custom_registry = CollectorRegistry()

# מדדים עבור Prometheus
REQUEST_COUNT = Counter(
    "api_requests", "Total number of API requests", ["endpoint", "method"], registry=custom_registry
)
REQUEST_LATENCY = Histogram(
    "api_request_latency_seconds", "Latency of API requests", ["endpoint", "method"], registry=custom_registry
)

main_branch = os.getenv("MAIN_BRANCH")

app = FastAPI(swagger_ui_parameters={"syntaxHighlight.theme": "obsidian"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """ Middleware לאיסוף סטטיסטיקות על זמן תגובה ומספר קריאות """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    endpoint = request.url.path
    method = request.method

    REQUEST_COUNT.labels(endpoint=endpoint, method=method).inc()
    REQUEST_LATENCY.labels(endpoint=endpoint, method=method).observe(process_time)

    return response

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/get_jenkins_last_build_result/{job_name}")
def get_last_build_result(job_name: str):
    return {"result": get_jenkins_last_build_result(job_name)}

@app.get("/get_last_build_results_in_folder/{folder_name}")
def get_last_build_results(folder_name: str):
    return get_last_build_results_in_folder(folder_name)

@app.post("/trigger_jenkins_build/{folder_name}/{job_name}/{main_branch}")
def trigger_build(folder_name: str, job_name: str, main_branch: str):
    return trigger_jenkins_build(folder_name, job_name, main_branch)

@app.get("/metrics")
def get_metrics():
    """ Endpoint שמחזיר את הנתונים עבור Prometheus """
    return Response(content=generate_latest(custom_registry), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
