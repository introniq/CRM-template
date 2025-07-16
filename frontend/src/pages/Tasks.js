import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Tasks.css';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPlus, FaSync } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = ['Follow-up', 'Call', 'Meeting', 'Proposal'];
const roles = ['Manager', 'Executive', 'Team Lead'];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Follow-up',
    assignee: '',
    role: 'Manager',
    due: '',
    reminders: [],
    createdAt: Timestamp.fromDate(new Date()),
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt || Date.now())),
          due: data.due instanceof Timestamp ? data.due.toDate().toISOString().slice(0, 16) : data.due || '',
        };
      });
      console.log('Fetched tasks:', tasksData.map((task) => ({
        id: task.id,
        title: task.title,
        createdAt: task.createdAt.toDate().toISOString(),
        due: task.due,
      })));
      setTasks(tasksData);
    }, (error) => console.error("Error fetching tasks:", error));
    return () => unsubscribe();
  }, []);

  const handleTaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      let reminders = [...(newTask.reminders || [])];
      if (checked) {
        reminders.push(value);
      } else {
        reminders = reminders.filter((rem) => rem !== value);
      }
      setNewTask({ ...newTask, reminders });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error('Task title is required!');
      return;
    }
    try {
      const taskData = {
        ...newTask,
        createdAt: Timestamp.fromDate(new Date()),
        due: newTask.due ? Timestamp.fromDate(new Date(newTask.due)) : null,
      };
      await addDoc(collection(db, 'tasks'), taskData);
      toast.success('Task added successfully!');
      setShowAddTaskModal(false);
      setNewTask({
        title: '',
        category: 'Follow-up',
        assignee: '',
        role: 'Manager',
        due: '',
        reminders: [],
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error('Failed to add task.');
    }
  };

  const handleSyncCalendar = (task) => {
    // Simulate calendar sync (e.g., Google Calendar API)
    const event = {
      title: task.title,
      due: task.due ? new Date(task.due).toISOString() : 'No due date',
      reminders: task.reminders || [],
      category: task.category || 'N/A',
      assignee: task.assignee || 'N/A',
      role: task.role || 'N/A',
    };
    console.log('Syncing task to calendar:', event);
    toast.success(`Task "${task.title}" synced to calendar!`);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = categoryFilter ? task.category === categoryFilter : true;
    const matchesRole = roleFilter ? task.role === roleFilter : true;
    return matchesCategory && matchesRole;
  });

  return (
    <div className="tasks-container">
      <Sidebar />
      <CrNavbar />
      <main className="tasks-main mt-5">
        <div className="tasks-header">
          <h2 className="tasks-title">Tasks & Reminders</h2>
          <button
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => setShowAddTaskModal(true)}
          >
            <FaPlus /> Add New Task
          </button>
        </div>

        <div className="tasks-filters">
          <select
            className="filter-dropdown"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="filter-dropdown"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            className="calendar-sync-btn"
            onClick={() => filteredTasks.forEach(handleSyncCalendar)}
          >
            <FaSync /> Sync Calendar
          </button>
        </div>

        <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)} centered>
          <Modal.Header closeButton className="border-b-0">
            <Modal.Title className="text-lg font-semibold text-gray-800">Add New Task</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={handleTaskChange}
                  className="text-sm"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Category</Form.Label>
                <Form.Select name="category" value={newTask.category} onChange={handleTaskChange} className="text-sm">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Assignee</Form.Label>
                <Form.Control
                  type="text"
                  name="assignee"
                  placeholder="Enter assignee"
                  value={newTask.assignee}
                  onChange={handleTaskChange}
                  className="text-sm"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Role</Form.Label>
                <Form.Select name="role" value={newTask.role} onChange={handleTaskChange} className="text-sm">
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Due Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="due"
                  value={newTask.due}
                  onChange={handleTaskChange}
                  className="text-sm"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Reminders</Form.Label>
                <div className="reminder-checkboxes">
                  {['email', 'push', 'whatsapp'].map((reminder) => (
                    <label key={reminder} className="reminder-label">
                      <input
                        type="checkbox"
                        name="reminders"
                        value={reminder}
                        checked={newTask.reminders?.includes(reminder)}
                        onChange={handleTaskChange}
                      />
                      {reminder.charAt(0).toUpperCase() + reminder.slice(1)}
                    </label>
                  ))}
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-t-0">
            <Button
              variant="outline-secondary"
              onClick={() => setShowAddTaskModal(false)}
              className="px-4 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTask}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
              disabled={!newTask.title}
            >
              Add Task
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="task-grid">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className={`task-card category-${task.category?.toLowerCase() || 'default'}`}>
                <h4>{task.title}</h4>
                <p><strong>Category:</strong> {task.category || 'N/A'}</p>
                <p><strong>Assignee:</strong> {task.assignee || 'N/A'} ({task.role || 'N/A'})</p>
                <p><strong>Due:</strong> {task.due ? new Date(task.due).toLocaleString() : 'N/A'}</p>
                <div className="reminder-labels">
                  {task.reminders?.map((reminder) => (
                    <span key={reminder} className={`reminder ${reminder}`}>
                      {reminder.charAt(0).toUpperCase() + reminder.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="no-tasks">No tasks match the selected filters.</p>
          )}
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
    </div>
  );
};

export default Tasks;