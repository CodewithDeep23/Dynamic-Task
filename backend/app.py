from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/?readPreference=primary&ssl=false")
db = client.task_manager
tasks_collection = db.tasks
employees_collection = db.employees

# Add a task
@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.json
    task = {
        "task_name": data['task_name'],
        "priority": data['priority'],
        "skill": data['skill'],
        "status": "Pending",
        "assigned_to": None
    }
    task_id = tasks_collection.insert_one(task).inserted_id
    return jsonify({"message": "Task added successfully!", "task_id": str(task_id)})

# Allocate a task
@app.route('/allocate_task', methods=['GET'])
def allocate_task():
    task = tasks_collection.find_one(sort=[("priority", 1)])
    if task:
        assigned_employee = assign_employee(task['skill'])
        if assigned_employee != "No suitable employee found":
            tasks_collection.update_one(
                {"_id": task["_id"]},
                {"$set": {"assigned_to": assigned_employee, "status": "Allocated"}}
            )
            return jsonify({
                "task": task['task_name'],
                "assigned_to": assigned_employee
            })
        return jsonify({"message": "No suitable employee found!"})
    return jsonify({"message": "No tasks available!"})

# Assign an employee based on skill
def assign_employee(skill):
    employee = employees_collection.find_one({"skills": skill})
    if employee:
        return employee['name']
    return "No suitable employee found"

# Add or Update an Employee
@app.route('/manage_employee', methods=['POST'])
def manage_employee():
    data = request.json
    employee_name = data['name']
    skills = data['skills']
    existing_employee = employees_collection.find_one({"name": employee_name})
    if existing_employee:
        employees_collection.update_one(
            {"name": employee_name},
            {"$set": {"skills": skills}}
        )
        return jsonify({"message": f"Employee {employee_name}'s skills updated successfully!"})
    else:
        employees_collection.insert_one({"name": employee_name, "skills": skills})
        return jsonify({"message": f"Employee {employee_name} added successfully!"})

# Edit a task
@app.route('/edit_task/<task_id>', methods=['PUT'])
def edit_task(task_id):
    data = request.json
    updated_task = {
        "task_name": data['task_name'],
        "priority": data['priority'],
        "skill": data['skill']
    }
    result = tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": updated_task})
    if result.modified_count > 0:
        return jsonify({"message": "Task updated successfully!"})
    return jsonify({"message": "No task found with the provided ID."})

# Fetch tasks assigned to an employee
@app.route('/employee_tasks/<employee_name>', methods=['GET'])
def employee_tasks(employee_name):
    tasks = list(tasks_collection.find({"assigned_to": employee_name}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks)

# Update task status
@app.route('/update_task_status/<task_id>', methods=['PUT'])
def update_task_status(task_id):
    data = request.json
    result = tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": data['status']}}
    )
    if result.modified_count > 0:
        return jsonify({"message": "Task status updated successfully!"})
    return jsonify({"message": "No task found with the provided ID."})

if __name__ == "__main__":
    app.run(debug=True)
