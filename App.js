import React, { useState } from 'react';

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
    const response = await fetch('http://127.0.0.1:5000/add_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_name: taskName, priority, skill })
    });
    const data = await response.json();
    alert(data.message);
  };

  const allocateTask = async () => {
    const response = await fetch('http://127.0.0.1:5000/allocate_task');
    const data = await response.json();
    setTasks([...tasks, data]);
  };

  const manageEmployee = async () => {
    const response = await fetch('http://127.0.0.1:5000/manage_employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: employeeName,
        skills: employeeSkills.split(",")
      })
    });
    const data = await response.json();
    alert(data.message);
  };

  const fetchEmployeeTasks = async () => {
    const response = await fetch(`http://127.0.0.1:5000/employee_tasks/${employeeName}`);
    const data = await response.json();
    setEmployeeTasks(data);
  };

  const updateTaskStatus = async (taskId) => {
    const response = await fetch(`http://127.0.0.1:5000/update_task_status/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    alert(data.message);
    fetchEmployeeTasks();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Management System</h1>

      <div>
        <h2>Add Task</h2>
        <input type="text" placeholder="Task Name" onChange={(e) => setTaskName(e.target.value)} />
        <input type="number" placeholder="Priority" onChange={(e) => setPriority(e.target.value)} />
        <input type="text" placeholder="Skill" onChange={(e) => setSkill(e.target.value)} />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div>
        <h2>Allocate Task</h2>
        <button onClick={allocateTask}>Allocate Task</button>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{`Task: ${task.task}, Assigned To: ${task.assigned_to}`}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Manage Employees</h2>
        <input type="text" placeholder="Employee Name" onChange={(e) => setEmployeeName(e.target.value)} />
        <input type="text" placeholder="Skills (comma-separated)" onChange={(e) => setEmployeeSkills(e.target.value)} />
        <button onClick={manageEmployee}>Add/Update Employee</button>
      </div>

      <div>
        <h2>Employee Dashboard</h2>
        <input type="text" placeholder="Employee Name" onChange={(e) => setEmployeeName(e.target.value)} />
        <button onClick={fetchEmployeeTasks}>Fetch Tasks</button>
        <ul>
          {employeeTasks.map((task) => (
            <li key={task._id}>
              {`Task: ${task.task_name}, Status: ${task.status}`}
              <input type="text" placeholder="Update Status" onChange={(e) => setStatus(e.target.value)} />
              <button onClick={() => updateTaskStatus(task._id)}>Update Status</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

