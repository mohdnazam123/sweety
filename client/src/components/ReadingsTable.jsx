import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate, getSlotLabel } from "../readingHelpers";

function ReadingsTable({ readings, onDelete }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time slot</th>
            <th>Glucose (mg/dL)</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{formatDate(reading.readingDate)}</td>
              <td>{getSlotLabel(reading.timeSlot)}</td>
              <td>{reading.glucoseValue}</td>
              {onDelete && (
                <td>
                  <div className="row-actions">
                    <Link to={`/readings/${reading.id}/edit`} className="icon-action" aria-label="Edit reading">
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      className="icon-action danger"
                      onClick={() => onDelete(reading.id)}
                      aria-label="Delete reading"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReadingsTable;