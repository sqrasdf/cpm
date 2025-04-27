import React from "react";

function GanttChart({ activities, criticalPath }) {
  activities = activities.filter(
    (activity) => activity.name !== "START" && activity.name !== "END"
  );
  const maxDuration = Math.max(...activities.map((a) => a.early_finish));

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-activity-label">Activity</div>
        {Array.from({ length: maxDuration }).map((_, i) => (
          <div key={i + 1} className="gantt-time-label">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="gantt-body">
        {activities.map((activity) => {
          const isCritical = criticalPath.includes(activity.name);
          return (
            <div key={activity.name} className="gantt-row">
              <div className="gantt-activity-name">{activity.name}</div>
              <div className="gantt-bar-container">
                {Array.from({ length: maxDuration }).map((_, i) => {
                  const isActive =
                    i >= activity.early_start && i < activity.early_finish;
                  const isCriticalPeriod = isCritical && isActive;
                  return (
                    <div
                      key={i}
                      className={`gantt-cell ${isActive ? "active" : ""} ${
                        isCriticalPeriod ? "critical" : ""
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GanttChart;
