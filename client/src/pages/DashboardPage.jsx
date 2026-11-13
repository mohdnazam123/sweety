import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getSavedUser } from "../api";
import ReadingsTable from "../components/ReadingsTable";
import SummaryCard from "../components/SummaryCard";
import { getTodayDate } from "../readingHelpers";

function DashboardPage() {
  const user = getSavedUser();
  const [summary, setSummary] = useState(null);
  const [recentReadings, setRecentReadings] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    Promise.all([
      apiRequest(`/readings/summary?today=${getTodayDate()}`),
      apiRequest("/readings?limit=5"),
    ])
      .then(([summaryData, readingsData]) => {
        setSummary(summaryData);
        setRecentReadings(readingsData.readings);
      })
      .catch((error) => setErrorMessage(error.message));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <p>{todayLabel}</p>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Today's readings" value={summary?.todaysReadings} />
        <SummaryCard label="Total readings" value={summary?.totalReadings} />
        <SummaryCard label="Average glucose" value={summary?.averageGlucose?.toFixed(1)} unit="mg/dL" />
      </div>

      <div className="card">
        <h2>Recent readings</h2> 
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!recentReadings && !errorMessage && <p>Loading...</p>}
        {recentReadings && recentReadings.length === 0 && (
          <div className="empty-state">
            <p>No readings yet. Add your first blood glucose reading.</p>
            <Link to="/readings/new" className="button">Add reading</Link>
          </div>
        )}
        {recentReadings && recentReadings.length > 0 && <ReadingsTable readings={recentReadings} />}
      </div>
    </>
  );
}

export default DashboardPage;