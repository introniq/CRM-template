import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Tasks.css';
import CrNavbar from '../components/Navbar';

const dummyTasks = [
  {
    id: 1,
    title: 'Follow up with client',
    category: 'Follow-up',
    assignee: 'Sales Lead',
    role: 'Manager',
    due: '2025-07-14 10:00',
    reminders: ['email', 'push'],
  },
  {
    id: 2,
    title: 'Call new lead',
    category: 'Call',
    assignee: 'Anjali',
    role: 'Executive',
    due: '2025-07-15 09:00',
    reminders: ['whatsapp'],
  },
  {
    id: 3,
    title: 'Internal team meeting',
    category: 'Meeting',
    assignee: 'Team Alpha',
    role: 'Team Lead',
    due: '2025-07-16 11:30',
    reminders: ['email'],
  },
  {
    id: 4,
    title: 'Send new proposal',
    category: 'Proposal',
    assignee: 'Vansh',
    role: 'Manager',
    due: '2025-07-17 14:00',
    reminders: ['email', 'push', 'whatsapp'],
  },
];

const Tasks = () => {
  const [tasks] = useState(dummyTasks);

  return (
    <div className="tasks-container">
      <Sidebar />
      <CrNavbar/>
      <main className="tasks-main">
        <h2 className="tasks-title">Tasks & Reminders</h2>

        <div className="tasks-filters">
          <select className="filter-dropdown">
            <option value="">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Executive">Executive</option>
            <option value="Team Lead">Team Lead</option>
          </select>

          <select className="filter-dropdown">
            <option value="">All Categories</option>
            <option value="Call">Call</option>
            <option value="Meeting">Meeting</option>
            <option value="Proposal">Proposal</option>
            <option value="Follow-up">Follow-up</option>
          </select>

          <button className="calendar-sync-btn">📅 Sync Calendar</button>
        </div>

        <div className="task-grid">
          {tasks.map(task => (
            <div key={task.id} className={`task-card category-${task.category.toLowerCase()}`}>
              <h4>{task.title}</h4>
              <p><strong>Category:</strong> {task.category}</p>
              <p><strong>Assignee:</strong> {task.assignee} ({task.role})</p>
              <p><strong>Due:</strong> {new Date(task.due).toLocaleString()}</p>

              <div className="reminder-labels">
                {task.reminders.includes('email') && <span className="reminder email">Email</span>}
                {task.reminders.includes('push') && <span className="reminder push">Push</span>}
                {task.reminders.includes('whatsapp') && <span className="reminder whatsapp">WhatsApp</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tasks;
