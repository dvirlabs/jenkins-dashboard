import uvicorn
from fastapi import FastAPI
from utils import *
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

# @app.get("/get_jenkins_last_build/{job_name}")
# def get_last_build(job_name: str):
#     return get_jenkins_last_build(job_name)

@app.get("/get_jenkins_last_build_result/{job_name}")
def get_last_build_result(job_name: str):
    return {"result": get_jenkins_last_build_result(job_name)}

@app.get("/get_last_build_results_in_folder/{folder_name}")
def get_last_build_results(folder_name: str):
    return get_last_build_results_in_folder(folder_name)

@app.post("/trigger_jenkins_build/{job_name}")
def trigger_build(job_name: str):
    return trigger_jenkins_build(job_name)









if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)