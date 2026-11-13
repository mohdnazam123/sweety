import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import ReadingForm from "../components/ReadingForm";

function AddReadingPage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    await apiRequest("/readings", { method: "POST", body: JSON.stringify(values) });
    navigate("/readings");
  }

  return (
    <>
      <div className="page-header">
        <h1>Add Reading</h1>
        <p>Record a blood glucose reading.</p>
      </div>
      <div className="card form-card">
        <ReadingForm submitLabel="Save reading" onSubmit={handleSubmit} />
      </div>
    </>
  );
}

export default AddReadingPage;