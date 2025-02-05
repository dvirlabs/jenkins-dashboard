import React, { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;
const buildsPath = process.env.REACT_APP_BUILDS_PATH;
const teamName = process.env.REACT_APP_TEAM_NAME;

const JenkinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState("ALL");
  const [priorityResult, setPriorityResult] = useState("NONE");

  const fetchData = () => {
    fetch(`${apiUrl}/get_last_build_results_in_folder/${buildsPath}`)
      .then((response) => response.json())
      .then((data) => {
        const dataArray = Object.entries(data);
        setData(sortData(dataArray, selectedResult, priorityResult));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const sortData = (dataArray, filterResult, priority) => {
    let filteredData = filterResult === "ALL" ? dataArray : dataArray.filter(([_, value]) => value.result === filterResult);

    return filteredData.sort((a, b) => {
      if (priority !== "NONE") {
        if (a[1].result === priority && b[1].result !== priority) return -1;
        if (b[1].result === priority && a[1].result !== priority) return 1;
      }
      return 0;
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedResult, priorityResult]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Jenkins Job Results of: {teamName}</h2>

      {/* עיצוב שיפור רק עבור הפילטרים */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "10px", alignItems: "center" }}>
        <div>
          <label htmlFor="filter" style={{ fontWeight: "bold", marginRight: "5px" }}>Filter by Result:</label>
          <select
            id="filter"
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "5px",
              border: "1px solid #aaa",
              backgroundColor: "#f8f8f8",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All</option>
            <option value="FAILURE">Failure</option>
            <option value="SUCCESS">Success</option>
            <option value="UNSTABLE">Unstable</option>
            <option value="ABORTED">Aborted</option>
            <option value="NOT_BUILT">Not Built</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" style={{ fontWeight: "bold", marginRight: "5px" }}>Priority Result:</label>
          <select
            id="priority"
            value={priorityResult}
            onChange={(e) => setPriorityResult(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "5px",
              border: "1px solid #aaa",
              backgroundColor: "#f8f8f8",
              cursor: "pointer"
            }}
          >
            <option value="NONE">None</option>
            <option value="FAILURE">Failure</option>
            <option value="SUCCESS">Success</option>
            <option value="UNSTABLE">Unstable</option>
            <option value="ABORTED">Aborted</option>
            <option value="NOT_BUILT">Not Built</option>
          </select>
        </div>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Service Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Result</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Last Build Time</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Link To Build</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([serviceName, { result, timestamp, build_url }], index) => (
            <tr key={index}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{serviceName}</td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  color:
                    result === "SUCCESS"
                      ? "green"
                      : result === "FAILURE"
                      ? "red"
                      : result === "ABORTED"
                      ? "gray"
                      : result === "UNSTABLE"
                      ? "blue"
                      : result === "NOT_BUILT"
                      ? "orange"
                      : "black",
                }}
              >
                {result || "N/A"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {timestamp || "N/A"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {build_url ? (
                  <a
                    href={build_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "rgb(163, 148, 217)" }}
                  >
                    View Build
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JenkinsTable;
