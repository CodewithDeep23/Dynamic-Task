import React, { useState } from "react";

function App() {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState(0);
  const [skill, setSkill] = useState("");
  const [tasks, setTasks] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeSkills, setEmployeeSkills] = useState("");
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [status, setStatus] = useState("");

  const addTask = async () => {
    const response = await fetch("http://127.0.0.1:5000/add_task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_name: taskName, priority, skill }),
    });
    const data = await response.json();
    alert(data.message);
  };

  const allocateTask = async () => {
    const response = await fetch("http://127.0.0.1:5000/allocate_task");
    const data = await response.json();
    setTasks([...tasks, data]);
  };

  const manageEmployee = async () => {
    const response = await fetch("http://127.0.0.1:5000/manage_employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: employeeName,
        skills: employeeSkills.split(","),
      }),
    });
    const data = await response.json();
    alert(data.message);
  };

  const fetchEmployeeTasks = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/employee_tasks/${employeeName}`
    );
    const data = await response.json();
    setEmployeeTasks(data);
  };

  const updateTaskStatus = async (taskId) => {
    const response = await fetch(
      `http://127.0.0.1:5000/update_task_status/${taskId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const data = await response.json();
    alert(data.message);
    fetchEmployeeTasks();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Task Management System
      </h1>

      {/* Add Task Section */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Task</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Task Name"
            className="border rounded-lg p-2"
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Priority"
            className="border rounded-lg p-2"
            onChange={(e) => setPriority(e.target.value)}
          />
          <input
            type="text"
            placeholder="Skill"
            className="border rounded-lg p-2"
            onChange={(e) => setSkill(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={addTask}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Allocate Task Section */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Allocate Task</h2>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
          onClick={allocateTask}
        >
          Allocate Task
        </button>
        <div className="mt-4 max-h-48 overflow-y-auto">
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="border rounded-lg p-2 bg-gray-100 text-gray-800"
              >
                Task: {task.task}, Assigned To: {task.assigned_to}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Manage Employees Section */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Employees</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Employee Name"
            className="border rounded-lg p-2"
            onChange={(e) => setEmployeeName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            className="border rounded-lg p-2"
            onChange={(e) => setEmployeeSkills(e.target.value)}
          />
          <button
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
            onClick={manageEmployee}
          >
            Add/Update Employee
          </button>
        </div>
      </div>

      {/* Employee Dashboard Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Employee Dashboard</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Employee Name"
            className="border rounded-lg p-2"
            onChange={(e) => setEmployeeName(e.target.value)}
          />
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
            onClick={fetchEmployeeTasks}
          >
            Fetch Tasks
          </button>
          <ul className="mt-4 space-y-2">
            {employeeTasks.map((task) => (
              <li
                key={task._id}
                className="border rounded-lg p-2 bg-gray-100 text-gray-800"
              >
                Task: {task.task_name}, Status: {task.status}
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    placeholder="Update Status"
                    className="border rounded-lg p-2 flex-1"
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                    onClick={() => updateTaskStatus(task._id)}
                  >
                    Update Status
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
