# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class Activity:
    def __init__(self, name, duration, predecessors):
        self.name = name
        self.duration = duration
        self.predecessors = predecessors
        self.early_start = 0
        self.early_finish = 0
        self.late_start = 0
        self.late_finish = 0
        self.slack = 0

def calculate_cpm(activities):
    # Forward pass - calculate early start and early finish
    for activity in activities:
        if not activity.predecessors:
            activity.early_start = 0
        else:
            max_early_finish = 0
            for pred_name in activity.predecessors:
                pred = next(a for a in activities if a.name == pred_name)
                if pred.early_finish > max_early_finish:
                    max_early_finish = pred.early_finish
            activity.early_start = max_early_finish
        activity.early_finish = activity.early_start + activity.duration
    
    # Backward pass - calculate late start and late finish
    project_duration = max(a.early_finish for a in activities)
    for activity in reversed(activities):
        if not any(a.predecessors and activity.name in a.predecessors for a in activities):
            activity.late_finish = project_duration
        else:
            min_late_start = float('inf')
            for successor in activities:
                if activity.name in successor.predecessors:
                    if successor.late_start < min_late_start:
                        min_late_start = successor.late_start
            activity.late_finish = min_late_start
        activity.late_start = activity.late_finish - activity.duration
        activity.slack = activity.late_start - activity.early_start
    
    critical_path = []
    for activity in activities:
        if activity.slack == 0:
            critical_path.append(activity.name)
    
    return {
        'activities': [{
            'name': a.name,
            'duration': a.duration,
            'early_start': a.early_start,
            'early_finish': a.early_finish,
            'late_start': a.late_start,
            'late_finish': a.late_finish,
            'slack': a.slack,
            'predecessors': a.predecessors
        } for a in activities],
        'critical_path': critical_path,
        'project_duration': project_duration
    }

# @app.route('/cpm', methods=['POST'])
# def cpm():
#     data = request.json
#     activities = []
    
#     for item in data:
#         # Zmienione - teraz oczekujemy listy poprzedników
#         predecessors = item['predecessors'] if isinstance(item['predecessors'], list) else (
#             [p.strip() for p in item['predecessors'].split(',')] if item['predecessors'] else []
#         )
#         activities.append(Activity(
#             name=item['name'],
#             duration=int(item['duration']),
#             predecessors=predecessors
#         ))
    
#     result = calculate_cpm(activities)
#     return jsonify(result)

# if __name__ == '__main__':
#     app.run(debug=True)

@app.route('/cpm', methods=['POST'])
def cpm():
    data = request.json
    activities = []
    
    # Wstępna konwersja danych wejściowych
    for item in data:
        predecessors = item['predecessors'] if isinstance(item['predecessors'], list) else (
            [p.strip() for p in item['predecessors'].split(',')] if item['predecessors'] else []
        )
        activities.append(Activity(
            name=item['name'],
            duration=int(item['duration']),
            predecessors=predecessors
        ))

    # --- Dodaj START i END ---
    
    all_names = set(a.name for a in activities)
    all_predecessors = set(p for a in activities for p in a.predecessors)

    # Dodaj 'START' jako poprzednika do aktywności bez poprzedników
    for a in activities:
        if not a.predecessors:
            a.predecessors = ['START']

    # Aktywności końcowe: takie, które nie są poprzednikami innych
    terminal_activities = all_names - all_predecessors

    # Dodaj END jako zależny od terminalnych aktywności
    activities.append(Activity(
        name='END',
        duration=0,
        predecessors=list(terminal_activities)
    ))

    # Dodaj sztuczny START
    activities.insert(0, Activity(
        name='START',
        duration=0,
        predecessors=[]
    ))

    # Przekaz do funkcji CPM
    result = calculate_cpm(activities)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)