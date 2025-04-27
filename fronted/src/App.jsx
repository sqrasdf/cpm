// src/App.js
import React, { useState } from "react";
import "./App.css";

import ActivityInputRow from "./components/ActivityInputRow";
import ActivityTable from "./components/ActivityTable";
import CPMDiagram from "./components/CPMDiagram";
import GanttChart from "./components/GanttChart";

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

  const generatePositions = () => {
    if (!results) return {};

    const positions = {};
    const nameToActivity = {};
    results.activities.forEach((a) => {
      nameToActivity[a.name] = a;
    });

    const visited = {};
    const levels = {};

    // Rekurencyjnie znajdź poziom (kolumnę) dla aktywności
    const getLevel = (activityName) => {
      if (levels[activityName] !== undefined) {
        return levels[activityName];
      }

      const activity = nameToActivity[activityName];
      if (
        !activity ||
        !activity.predecessors ||
        activity.predecessors.length === 0
      ) {
        levels[activityName] = 0;
        return 0;
      }

      const predLevels = activity.predecessors.map((pred) => getLevel(pred));
      const maxPredLevel = Math.max(...predLevels);

      levels[activityName] = maxPredLevel + 1;
      return levels[activityName];
    };

    // Oblicz poziomy dla wszystkich aktywności
    results.activities.forEach((a) => {
      getLevel(a.name);
    });

    // Grupuj aktywności według poziomu
    const columns = {};
    for (const [name, level] of Object.entries(levels)) {
      if (!columns[level]) {
        columns[level] = [];
      }
      columns[level].push(name);
    }

    // Wyznacz pozycje
    Object.entries(columns).forEach(([level, names]) => {
      names.forEach((name, row) => {
        positions[name] = {
          x: 100 + parseInt(level) * 200,
          y: 100 + row * 200,
          column: parseInt(level),
          row: row,
        };
      });
    });

    return positions;
  };

  const positions = generatePositions();
  // console.log(positions);

  return (
    <div className="app">
      <h1>Critical Path Method (CPM) Calculator</h1>

      <form onSubmit={handleSubmit}>
        <div className="activities-container">
          {activities.map((activity, index) => (
            <ActivityInputRow
              key={index}
              index={index}
              activity={activity}
              onChange={handleActivityChange}
              onRemove={handleRemoveActivity}
              canRemove={activities.length > 1}
            />
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
        <>
          <h2>Results</h2>
          <p>
            <strong>Project Duration:</strong> {results.project_duration}
          </p>
          <p>
            <strong>Critical Path:</strong> {results.critical_path.join(" → ")}
          </p>
          <ActivityTable activities={results.activities} />
          <h2>CPM Diagram</h2>
          <CPMDiagram results={results} positions={positions} />
          <h2>Gantt Chart</h2>
          <GanttChart
            activities={results.activities}
            criticalPath={results.critical_path}
          />
        </>
      )}
    </div>
  );
}

export default App;
