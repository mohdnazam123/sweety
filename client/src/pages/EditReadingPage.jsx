import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import ReadingForm from "../components/ReadingForm";

function EditReadingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    apiRequest(`/readings/${id}`)
      .then((data) => setReading(data.reading))
      .catch((error) => setErrorMessage(error.message));
  }, [id]);

  async function handleSubmit(values) {
    await apiRequest(`/readings/${id}`, { method: "PUT", body: JSON.stringify(values) });
    navigate("/readings");
  }

  return (
    <>
      <div className="page-header">
        <h1>Edit Reading</h1>
        <p>Update this blood glucose reading.</p>
      </div>
      <div className="card form-card">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!errorMessage && !reading && <p>Loading...</p>}
        {reading && (
          <ReadingForm
            initialValues={{
              readingDate: reading.readingDate,
              timeSlot: reading.timeSlot,
              glucoseValue: String(reading.glucoseValue),
            }}
            submitLabel="Update reading"
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}

export default EditReadingPage;