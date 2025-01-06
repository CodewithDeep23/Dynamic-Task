from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

load_dotenv()

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.task_manager
tasks_collection = db.tasks
employees_collection = db.employees

# Login route
users_collection = db.users

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Fetch the user from the database
    user = users_collection.find_one({"username": username})
    
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        access_token = create_access_token(identity=username)
        return jsonify({"access_token": access_token}), 200
    
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        print("Username:", username)
        print("Password:", password)

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        if users_collection.find_one({"username": username}):
            return jsonify({"message": "User already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        users_collection.insert_one({"username": username, "password": hashed_password})

        return jsonify({"message": "Signup successful"}), 201
    except KeyError as e:
        return jsonify({'message': f'Missing key: {str(e)}'}), 400
    except Exception as e:
        print(e)  # Log the error
        return jsonify({'message': 'Internal Server Error'}), 500


# Add a task
@app.route('/add_task', methods=['POST'])
@jwt_required()
def add_task():
    current_user = get_jwt_identity()
    data = request.json
    task = {
        "task_name": data['task_name'],
        "priority": data['priority'],
        "skill": data['skill'],
        "status": "Pending",
        "assigned_to": None,
        "created_by": current_user
    }
    task_id = tasks_collection.insert_one(task).inserted_id
    return jsonify({"message": "Task added successfully!", "task_id": str(task_id)})

@app.route('/allocate_task', methods=['GET'])
@jwt_required()
def allocate_task():
    current_user = get_jwt_identity()
    task = tasks_collection.find_one({"status": {"$in": ["Pending", "In Progress"]}}, sort=[("priority", 1)])
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
        else:
            return jsonify({"message": "No suitable employee found for the task."})
    return jsonify({"message": "No tasks available!"})


# Assign an employee based on skill
def assign_employee(skill):
    employee = employees_collection.find_one({"skills": skill})
    if employee:
        return employee['name']
    return "No suitable employee found"

# Add or Update an Employee
@app.route('/manage_employee', methods=['POST'])
@jwt_required()
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
@jwt_required()
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
@jwt_required()
def employee_tasks(employee_name):
    tasks = list(tasks_collection.find({"assigned_to": employee_name}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks)

# Update task status
@app.route('/update_task_status/<task_id>', methods=['PUT'])
@jwt_required()
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
