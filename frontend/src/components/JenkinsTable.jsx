import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { SlRefresh } from "react-icons/sl";
import config from "../config";
import "react-toastify/dist/ReactToastify.css";
import "../style/jenkinsTable.css";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { ThreeCircles } from 'react-loader-spinner';
import * as colors from '@mui/material/colors';


// const apiUrl = process.env.REACT_APP_API_URL;
// const buildsPath = process.env.REACT_APP_BUILDS_PATH;
// const teamName = process.env.REACT_APP_TEAM_NAME;
// const mainBranch = process.env.REACT_APP_MAIN_BRANCH;

const apiUrl = config.apiUrl;
const buildsPath = config.buildsPath;
const teamName = config.teamName;
const mainBranch = config.mainBranch;

// const apiUrl = window.REACT_APP_API_URL;
// const buildsPath = window.REACT_APP_BUILDS_PATH;
// const teamName = window.REACT_APP_TEAM_NAME;
// const mainBranch = window.REACT_APP_MAIN_BRANCH;

const JenkinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingJobs, setBuildingJobs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState("");

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
    toast.info(`🔄 Triggering build for ${jobName}...`);
    setBuildingJobs((prev) => new Set(prev).add(jobName));

    fetch(`${apiUrl}/trigger_jenkins_build/${buildsPath}/${jobName}/${mainBranch}`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          toast.success(`✅ Build triggered successfully for ${jobName}!`);
          setTimeout(() => {
            setBuildingJobs((prev) => {
              const updatedJobs = new Set(prev);
              updatedJobs.delete(jobName);
              return updatedJobs;
            });
            fetchData();
          }, 10000);
        } else {
          toast.error(`❌ Failed to trigger ${jobName}: ${data.message}`);
          setBuildingJobs((prev) => {
            const updatedJobs = new Set(prev);
            updatedJobs.delete(jobName);
            return updatedJobs;
          });
        }
      })
      .catch(() => {
        toast.error(`❌ Error triggering build for ${jobName}`);
        setBuildingJobs((prev) => {
          const updatedJobs = new Set(prev);
          updatedJobs.delete(jobName);
          return updatedJobs;
        });
      });
  };

  const triggerAllBuilds = () => {
    if (window.confirm("Are you sure you want to run all builds?")) {
      toast.info("🚀 Running all builds...");
      data.forEach(([serviceName]) => triggerBuild(serviceName));
    }
  };

  const triggerFailedBuilds = () => {
    if (window.confirm("Are you sure you want to run only the failed builds?")) {
      toast.info("❌ Running failed builds...");
      data.forEach(([serviceName, { result }]) => {
        if (result !== "SUCCESS") {
          triggerBuild(serviceName);
        }
      });
    }
  };

  const filteredData = data.filter(([serviceName, { result }]) =>
    serviceName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedResult === "" || result === selectedResult)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#2434ce"
          ariaLabel="three-circles-loading"
        />
      </div>
    );
  }

  return (
    <div className="table-container">
      <h2 className="title">Jenkins Job Results of: {teamName}</h2>
      <ToastContainer className={"custom-toast"} position="bottom-right" autoClose={3000} hideProgressBar={false} />

      {/* Search and Filter Controls */}
      <Box display="flex" alignItems="center" mb={2}>
        {/* Search Box */}
        <TextField
          label="Search Services"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            marginRight: 2,
            '& .MuiInputBase-root': {
              color: colors.blue[700],  // Blue text color
            },
            '& .MuiInputLabel-root': {
              color: colors.blue[700],  // Blue label color
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                bordercolor: colors.blue[700],  // Blue border color
              },
              '&:hover fieldset': {
                bordercolor: colors.blue[500],  // Darker blue border on hover
              },
              '&.Mui-focused fieldset': {
                bordercolor: colors.blue[900],  // Darkest blue border on focus
              },
            },
          }}
        />

        {/* Results Filter */}
        <FormControl size="small">
          <InputLabel sx={{ color: colors.blue[700] }}>Filter Results</InputLabel>
          <Select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            label="Filter Results"
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  bordercolor: colors.blue[700],  // Blue border color
                },
                '&:hover fieldset': {
                  bordercolor: colors.blue[500],  // Darker blue border on hover
                },
                '&.Mui-focused fieldset': {
                  bordercolor: colors.blue[900],  // Darkest blue border on focus
                },
              },
              '& .MuiInputBase-root': {
                color: colors.blue[700],  // Blue text color
              },
            }}
          >
            <MenuItem value="">All Results</MenuItem>
            <MenuItem value="SUCCESS">✅ SUCCESS</MenuItem>
            <MenuItem value="FAILURE">❌ FAILURE</MenuItem>
            <MenuItem value="ABORTED">⚪ ABORTED</MenuItem>
            <MenuItem value="UNSTABLE">🔵 UNSTABLE</MenuItem>
            <MenuItem value="NOT_BUILT">🟠 NOT BUILT</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Service Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Result</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Last Build Time</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Link To Build</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Rebuild</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(([serviceName, { result, timestamp, build_url }], index) => (
            <tr key={index}>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {serviceName}
                {buildingJobs.has(serviceName) && (
                  <SlRefresh className="spinner" />
                )}
              </td>

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
                    style={{
                      textDecoration: "none",
                      color: "rgb(163, 148, 217)",
                    }}
                  >
                    View Build
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => triggerBuild(serviceName)}
                  style={{
                    backgroundColor: "rgb(18, 94, 187)",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontSize: "17px",
                  }}
                >
                  <SlRefresh /> Run
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Buttons */}
      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={triggerAllBuilds}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          🚀 Run All
        </button>
        <button
          onClick={triggerFailedBuilds}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          ❌ Run Failed Only
        </button>
      </div>
    </div>
  );
};

export default JenkinsTable;
