import React from "react";

function ActivityTable({ activities }) {
  return (
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
        {activities.map((activity, index) => (
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
  );
}

export default ActivityTable;
