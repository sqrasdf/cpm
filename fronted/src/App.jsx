// src/App.js
import React, { useState } from "react";
import "./App.css";

function App() {
  const [activities, setActivities] = useState([
    { name: "", predecessors: "", duration: "" },
  ]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleAddActivity = () => {
    setActivities([
      ...activities,
      { name: "", predecessors: "", duration: "" },
    ]);
  };

  const handleRemoveActivity = (index) => {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
  };

  const handleActivityChange = (index, field, value) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/cpm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          activities.map((a) => ({
            name: a.name,
            duration: a.duration,
            predecessors: a.predecessors,
          }))
        ),
      });

      if (!response.ok) {
        throw new Error("Error calculating CPM");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Funkcja do generowania pozycji dla diagramu
  const generatePositions = () => {
    if (!results) return {};

    const positions = {};
    const columns = {};
    let maxColumn = 0;

    // Przypisz aktywności do kolumn na podstawie early_start
    results.activities.forEach((activity) => {
      const column = activity.early_start;
      if (!columns[column]) {
        columns[column] = [];
        if (column > maxColumn) maxColumn = column;
      }
      columns[column].push(activity);
    });

    // Oblicz pozycje dla każdej aktywności
    Object.keys(columns).forEach((col) => {
      const colActivities = columns[col];
      colActivities.forEach((activity, row) => {
        positions[activity.name] = {
          x: 100 + parseInt(col) * 200,
          y: 100 + row * 120,
          column: parseInt(col),
          row: row,
        };
      });
    });

    return positions;
  };

  const positions = generatePositions();

  return (
    <div className="app">
      <h1>Critical Path Method (CPM) Calculator</h1>

      <form onSubmit={handleSubmit}>
        <div className="activities-container">
          {activities.map((activity, index) => (
            <div key={index} className="activity-row">
              <input
                type="text"
                placeholder="Activity name"
                value={activity.name}
                onChange={(e) =>
                  handleActivityChange(index, "name", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Predecessors (comma separated)"
                value={activity.predecessors}
                onChange={(e) =>
                  handleActivityChange(index, "predecessors", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Duration"
                value={activity.duration}
                onChange={(e) =>
                  handleActivityChange(index, "duration", e.target.value)
                }
                min="1"
                required
              />
              {activities.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveActivity(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="buttons">
          <button type="button" onClick={handleAddActivity}>
            Add Activity
          </button>
          <button type="submit">Calculate CPM</button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="results">
          <h2>Results</h2>
          <p>
            <strong>Project Duration:</strong> {results.project_duration}
          </p>
          <p>
            <strong>Critical Path:</strong> {results.critical_path.join(" → ")}
          </p>

          <h3>Activity Details</h3>
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Early Start</th>
                <th>Duration</th>
                <th>Early Finish</th>
                <th>Late Start</th>
                <th>Slack</th>
                <th>Late Finish</th>
              </tr>
            </thead>
            <tbody>
              {results.activities.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.name}</td>
                  <td>{activity.early_start}</td>
                  <td>{activity.duration}</td>
                  <td>{activity.early_finish}</td>
                  <td>{activity.late_start}</td>
                  <td>{activity.slack}</td>
                  <td>{activity.late_finish}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Diagram</h3>
          <div className="diagram-container">
            <svg className="connections-svg" width="100%" height="500">
              {results.activities.map((activity) => {
                if (!activity.predecessors || !positions[activity.name])
                  return null;

                return activity.predecessors.map((pred) => {
                  if (!positions[pred]) return null;

                  const startX = positions[pred].x + 75;
                  const startY = positions[pred].y + 50;
                  const endX = positions[activity.name].x + 75;
                  const endY = positions[activity.name].y;

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

            <div className="diagram">
              {results.activities.map((activity) => {
                if (!positions[activity.name]) return null;
                const isCritical = results.critical_path.includes(
                  activity.name
                );
                const { x, y } = positions[activity.name];

                return (
                  <div
                    key={activity.name}
                    className={`activity-box ${isCritical ? "critical" : ""}`}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      zIndex: 10,
                    }}
                  >
                    <div className="activity-name">{activity.name}</div>
                    <div className="activity-duration">{activity.duration}</div>
                    <div className="activity-times">
                      <div>ES: {activity.early_start}</div>
                      <div>EF: {activity.early_finish}</div>
                      <div>LS: {activity.late_start}</div>
                      <div>LF: {activity.late_finish}</div>
                    </div>
                    <div className="activity-slack">
                      Slack: {activity.slack}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
