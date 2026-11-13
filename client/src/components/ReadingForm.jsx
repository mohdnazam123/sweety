import { useState } from "react";
import { TIME_SLOTS, getTodayDate } from "../readingHelpers";

function ReadingForm({ initialValues, submitLabel, onSubmit }) {
  const [form, setForm] = useState(
    initialValues || {
      readingDate: getTodayDate(),
      timeSlot: TIME_SLOTS[0].value,
      glucoseValue: "",
    }
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);
    try {
      await onSubmit(form);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return ( 
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="readingDate">Date</label>
        <input id="readingDate" name="readingDate" type="date" max={getTodayDate()} value={form.readingDate} onChange={handleChange} />
      </div>

      <div className="form-field">
        <p className="field-label">Time slot</p>
        <div className="slot-options">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.value}
              type="button"
              className={`slot-option ${form.timeSlot === slot.value ? "selected" : ""}`}
              onClick={() => setForm({ ...form, timeSlot: slot.value })}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="glucoseValue">Glucose value (mg/dL)</label>
        <input id="glucoseValue" name="glucoseValue" type="number" value={form.glucoseValue} onChange={handleChange} />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button type="submit" className="button" disabled={isSaving}>
        {isSaving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ReadingForm;