import React from "react";
import ActivityTile from "./ActivityTile";

function CPMDiagram({ results, positions }) {
  return (
    <div className="diagram-container">
      <div className="diagram">
        {results.activities.map((activity) => {
          if (!positions[activity.name]) return null;
          const isCritical = results.critical_path.includes(activity.name);
          const { x, y } = positions[activity.name];

          return (
            <ActivityTile
              key={activity.name}
              activity={activity}
              isCritical={isCritical}
              x={x}
              y={y}
            ></ActivityTile>
          );
        })}
      </div>

      {/* <svg className="connections-svg" width="100%" height="500"> */}
      <svg
        className="connections-svg"
        width="100%"
        height="100%"
        overflow="visible"
      >
        {results.activities.map((activity) => {
          if (!activity.predecessors || !positions[activity.name]) return null;

          return activity.predecessors.map((pred) => {
            if (!positions[pred]) return null;

            const startX = positions[pred].x + 150 + 20 + 4;
            const startY = positions[pred].y + 75;
            const endX = positions[activity.name].x;
            const endY = positions[activity.name].y + 75;

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
