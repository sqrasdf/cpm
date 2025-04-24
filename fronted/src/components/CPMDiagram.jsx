import React from "react";

function CPMDiagram({ results, positions }) {
  return (
    <div className="diagram-container">
      <div className="diagram">
        {results.activities.map((activity) => {
          if (!positions[activity.name]) return null;
          const isCritical = results.critical_path.includes(activity.name);
          const { x, y } = positions[activity.name];

          return (
            <div
              key={activity.name}
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
        })}
      </div>

      <svg className="connections-svg" width="100%" height="500">
        {results.activities.map((activity) => {
          if (!activity.predecessors || !positions[activity.name]) return null;

          return activity.predecessors.map((pred) => {
            if (!positions[pred]) return null;

            // const startX = positions[pred].x + 75; // startowe, wygenerowane przez deepseeka
            // const startY = positions[pred].y + 50;
            // const endX = positions[activity.name].x + 75;
            // const endY = positions[activity.name].y;

            const startX = positions[pred].x + 150 + 20 + 4;
            const startY = positions[pred].y + 75 + 10;
            const endX = positions[activity.name].x;
            const endY = positions[activity.name].y + 75 + 10;

            return (
              <line
                key={`${pred}-${activity.name}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#333"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          });
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default CPMDiagram;
