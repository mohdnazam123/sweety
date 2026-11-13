function SummaryCard({ label, value = "—", unit }) {
  return (
    <div className="card summary-card">
      <div className="summary-label">{label}</div>
      <div>
        <span className="summary-value">{value}</span>
        {unit && value !== "—" && <span className="summary-unit">{unit}</span>}
      </div>
    </div>
  );
}

export default SummaryCard;