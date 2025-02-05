import React, { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;
const buildsPath = process.env.REACT_APP_BUILDS_PATH;
const teamName = process.env.REACT_APP_TEAM_NAME;

const JenkinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingJobs, setBuildingJobs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState(""); // ברירת מחדל: הצג הכל

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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
          alert(`Error triggering job ${jobName}: ${data.message}`);
          setBuildingJobs((prev) => {
            const updatedJobs = new Set(prev);
            updatedJobs.delete(jobName);
            return updatedJobs;
          });
        }
      })
      .catch(() => {
        alert(`Error triggering build for ${jobName}`);
        setBuildingJobs((prev) => {
          const updatedJobs = new Set(prev);
          updatedJobs.delete(jobName);
          return updatedJobs;
        });
      });
  };

  const triggerAllBuilds = () => {
    if (window.confirm("Are you sure you want to run all builds?")) {
      data.forEach(([serviceName]) => triggerBuild(serviceName));
    }
  };

  const triggerFailedBuilds = () => {
    if (window.confirm("Are you sure you want to run only the failed builds?")) {
      data.forEach(([serviceName, { result }]) => {
        if (result !== "SUCCESS") {
          triggerBuild(serviceName);
        }
      });
    }
  };

  // 🔍 סינון השירותים לפי שם ותוצאה
  const filteredData = data.filter(([serviceName, { result }]) =>
    serviceName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedResult === "" || result === selectedResult)
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Jenkins Job Results of: {teamName}</h2>

      {/* 🔍 חיפוש + Dropdown לסינון */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="🔍 Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />

        <select
          value={selectedResult}
          onChange={(e) => setSelectedResult(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Results</option>
          <option value="SUCCESS">✅ SUCCESS</option>
          <option value="FAILURE">❌ FAILURE</option>
          <option value="ABORTED">⚪ ABORTED</option>
          <option value="UNSTABLE">🔵 UNSTABLE</option>
          <option value="NOT_BUILT">🟠 NOT BUILT</option>
        </select>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Service Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Result</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Last Build Time</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Link To Build</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(([serviceName, { result, timestamp, build_url }], index) => (
            <tr key={index}>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {serviceName} {buildingJobs.has(serviceName) && "🔄"}
              </td>
              <td style={{
                border: "1px solid black",
                padding: "8px",
                color:
                  result === "SUCCESS" ? "green" :
                  result === "FAILURE" ? "red" :
                  result === "ABORTED" ? "gray" :
                  result === "UNSTABLE" ? "blue" :
                  result === "NOT_BUILT" ? "orange" : "black",
              }}>
                {result || "N/A"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{timestamp || "N/A"}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {build_url ? (
                  <a href={build_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "rgb(163, 148, 217)" }}>
                    View Build
                  </a>
                ) : "N/A"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                <button 
                  onClick={() => triggerBuild(serviceName)} 
                  style={{
                    backgroundColor: "rgb(98, 158, 230)", 
                    color: "white", 
                    border: "none", 
                    padding: "5px 10px", 
                    cursor: "pointer", 
                    borderRadius: "5px"
                  }}>
                  🔄 Run
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button onClick={triggerAllBuilds} style={{ backgroundColor: "green", color: "white", padding: "10px 15px", borderRadius: "5px" }}>🚀 Run All</button>
        <button onClick={triggerFailedBuilds} style={{ backgroundColor: "red", color: "white", padding: "10px 15px", borderRadius: "5px" }}>❌ Run Failed Only</button>
      </div>
    </div>
  );
};

export default JenkinsTable;
