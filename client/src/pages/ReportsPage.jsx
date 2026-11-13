import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import ReportCard from "../components/ReportCard";
import { getTodayDate } from "../readingHelpers";

function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [reports, setReports] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!selectedDate) return;

    apiRequest(`/reports?date=${selectedDate}`)
      .then((data) => {
        setReports(data);
        setErrorMessage("");
      })
      .catch((error) => setErrorMessage(error.message));
  }, [selectedDate]);

  return (
    <>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Pick a date to see your daily, month-to-date and previous month reports.</p>
      </div>

      <div className="report-controls">
        <label htmlFor="reportDate">Select date</label>
        <input
          id="reportDate"
          type="date"
          max={getTodayDate()}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!reports && !errorMessage && <p>Loading...</p>}

      {reports && (
        <div className="report-grid">
          <ReportCard title="Daily report" report={reports.daily} />
          <ReportCard title="Month-to-date report" report={reports.monthToDate} />
          <ReportCard title="Previous month report" report={reports.previousMonth} />
        </div>
      )}
    </>
  );
}

export default ReportsPage;