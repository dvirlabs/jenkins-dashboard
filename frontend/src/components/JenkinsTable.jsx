import React, { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react"; // אייקון מקצועי
import "../style/jenkinsTable.css";

const apiUrl = process.env.REACT_APP_API_URL;
const buildsPath = process.env.REACT_APP_BUILDS_PATH;
const teamName = process.env.REACT_APP_TEAM_NAME;

const JenkinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingJobs, setBuildingJobs] = useState(new Set());

  const fetchData = () => {
    fetch(`${apiUrl}/get_last_build_results_in_folder/${buildsPath}`)
      .then((response) => response.json())
      .then((data) => {
        setData(Object.entries(data));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const triggerBuild = (jobName) => {
    setBuildingJobs((prev) => new Set(prev).add(jobName));

    fetch(`${apiUrl}/trigger_jenkins_build/${jobName}`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setTimeout(() => {
            setBuildingJobs((prev) => {
              const updatedJobs = new Set(prev);
              updatedJobs.delete(jobName);
              return updatedJobs;
            });
            fetchData();
          }, 10000);
        } else {
          console.error("Failed to trigger job:", data.message);
          alert(`Error triggering job ${jobName}: ${data.message}`);
          setBuildingJobs((prev) => {
            const updatedJobs = new Set(prev);
            updatedJobs.delete(jobName);
            return updatedJobs;
          });
        }
      })
      .catch((error) => {
        console.error("Error triggering build:", error);
        alert(`Error triggering build for ${jobName}`);
        setBuildingJobs((prev) => {
          const updatedJobs = new Set(prev);
          updatedJobs.delete(jobName);
          return updatedJobs;
        });
      });
  };

  const triggerAllBuilds = () => {
    data.forEach(([serviceName]) => triggerBuild(serviceName));
  };

  const triggerFailedBuilds = () => {
    data.forEach(([serviceName, { result }]) => {
      if (result !== "SUCCESS") {
        triggerBuild(serviceName);
      }
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="table-container">
      <h2>Jenkins Job Results of: {teamName}</h2>
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Result</th>
            <th>Last Build Time</th>
            <th>Link To Build</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([serviceName, { result, timestamp, build_url }], index) => (
            <tr key={index}>
              <td>
                {serviceName}{" "}
                {buildingJobs.has(serviceName) && <RefreshCcw className="spinner" size={20} />}
              </td>
              <td
                className={
                  result === "SUCCESS"
                    ? "status-success"
                    : result === "FAILURE"
                    ? "status-failure"
                    : result === "ABORTED"
                    ? "status-aborted"
                    : result === "UNSTABLE"
                    ? "status-unstable"
                    : result === "NOT_BUILT"
                    ? "status-not-built"
                    : ""
                }
              >
                {result || "N/A"}
              </td>
              <td>{timestamp || "N/A"}</td>
              <td>
                {build_url ? (
                  <a href={build_url} target="_blank" rel="noopener noreferrer">
                    View Build
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td style={{ textAlign: "center" }}>
                <button onClick={() => triggerBuild(serviceName)} className="run-btn">
                  {buildingJobs.has(serviceName) ? <RefreshCcw className="spinner" size={20} /> : <RefreshCcw size={20} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions-container">
        <button onClick={triggerAllBuilds} className="run-all-btn">
          🚀 Run All
        </button>

        <button onClick={triggerFailedBuilds} className="run-failed-btn">
          ❌ Run Failed Only
        </button>
      </div>
    </div>
  );
};

export default JenkinsTable;
