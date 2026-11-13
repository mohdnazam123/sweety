import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import ReadingsTable from "../components/ReadingsTable";

function ReadingsPage() {
  const [readings, setReadings] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    apiRequest("/readings")
      .then((data) => setReadings(data.readings))
      .catch((error) => setErrorMessage(error.message));
  }, []);

  async function handleDelete(readingId) {
    if (!window.confirm("Delete this reading?")) return;

    try {
      await apiRequest(`/readings/${readingId}`, { method: "DELETE" });
      setReadings(readings.filter((reading) => reading.id !== readingId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <div className="page-header-row">
        <div className="page-header">
          <h1>My Readings</h1>
          <p>All your recorded blood glucose readings.</p>
        </div>
        <Link to="/readings/new" className="button">Add reading</Link>
      </div>

      <div className="card">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!readings && !errorMessage && <p>Loading...</p>}
        {readings && readings.length === 0 && (
          <div className="empty-state">
            <p>No readings yet. Add your first blood glucose reading.</p>
          </div>
        )}
        {readings && readings.length > 0 && <ReadingsTable readings={readings} onDelete={handleDelete} />}
      </div>
    </>
  );
}

export default ReadingsPage;