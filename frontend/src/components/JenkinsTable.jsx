import React, { useState, useEffect } from "react";

const JenkinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from your FastAPI endpoint
    fetch("http://localhost:8000/get_last_build_results_in_folder/My-Apps")
      .then((response) => response.json())
      .then((data) => {
        setData(Object.entries(data)); // Convert object to array of [key, value]
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Jenkins Job Results</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Service Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Result</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Last Build Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([serviceName, { result, timestamp }], index) => (
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
                      : result === "ERROR"
                      ? "purple"
                      : "black", // Default color for unknown results
                }}
              >
                {result || "N/A"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {timestamp || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JenkinsTable;
