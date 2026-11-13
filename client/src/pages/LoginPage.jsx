import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(data.token, data.user);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="brand">Sweety</div>
        <p className="auth-subtitle">Log in to track your blood glucose.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="button">Log in</button>
        </form>

        <p className="auth-footer">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;