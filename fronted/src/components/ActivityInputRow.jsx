import React from "react";

function ActivityInputRow({ index, activity, onChange, onRemove, canRemove }) {
  return (
    <div className="activity-row">
      <input
        type="text"
        placeholder="Activity name"
        value={activity.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Predecessors (comma separated)"
        value={activity.predecessors}
        onChange={(e) => onChange(index, "predecessors", e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration"
        value={activity.duration}
        onChange={(e) => onChange(index, "duration", e.target.value)}
        min="1"
        required
      />
      {canRemove && (
        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove(index)}
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default ActivityInputRow;
