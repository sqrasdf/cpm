import React from "react";

function ActivityTile({ activity, isCritical, x, y }) {
  return (
    <div
      className={`activity-box ${isCritical ? "critical" : ""}`}
      style={{ left: `${x}px`, top: `${y}px`, zIndex: 0 }}
    >
      <div className="activity-name">{activity.name}</div>
      <div className="activity-duration">{activity.duration}</div>
      <div className="activity-times">
        <div>ES: {activity.early_start}</div>
        <div>EF: {activity.early_finish}</div>
        <div>LS: {activity.late_start}</div>
        <div>LF: {activity.late_finish}</div>
      </div>
      <div className="activity-slack">Slack: {activity.slack}</div>
    </div>
  );
}

export default ActivityTile;
