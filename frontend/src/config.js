const config = {
    apiUrl: window.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL,
    buildsPath: window.env.REACT_APP_BUILDS_PATH || process.env.REACT_APP_BUILDS_PATH,
    teamName: window.env.REACT_APP_TEAM_NAME || process.env.REACT_APP_TEAM_NAME,
    mainBranch: window.env.REACT_APP_MAIN_BRANCH || process.env.REACT_APP_MAIN_BRANCH,
  };
  
  export default config;  