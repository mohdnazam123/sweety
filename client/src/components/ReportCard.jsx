import { formatDate } from "../readingHelpers";
import ReadingsTable from "./ReadingsTable";

function formatRange(startDate, endDate) {
  if (startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function ReportCard({ title, report }) {
  const stats = [
    { label: "Highest", value: report.highest, unit: "mg/dL" },
    { label: "Lowest", value: report.lowest, unit: "mg/dL" },
   { label: "Average", value: report.average?.toFixed(1), unit: "mg/dL" },
    { label: "Readings", value: report.totalReadings },
  ];

  return (
    <div className="card">
      <div className="report-heading">
        <h2>{title}</h2>
        <span className="report-range">{formatRange(report.startDate, report.endDate)}</span>
      </div>

      {report.totalReadings === 0 ? (
        <div className="empty-state">
          <p>No readings in this period.</p>
        </div>
      ) : (
        <div className="report-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="report-stat">
              <div className="report-stat-label">{stat.label}</div>
              <div className="report-stat-value">
                {stat.value}
                {stat.unit && <span className="summary-unit">{stat.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {report.readings && report.readings.length > 0 && (
        <div className="report-readings">
          <ReadingsTable readings={report.readings} />
        </div>
      )}
    </div>
  );
}

export default ReportCard;