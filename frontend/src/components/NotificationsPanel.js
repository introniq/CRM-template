import '../styles/NotiPanel.css';
import { FaTimes, FaBell, FaTasks, FaClipboardList, FaUserShield } from 'react-icons/fa';
import { useState } from 'react';

const NotificationsPanel = ({ onClose }) => {
  const [alerts, setAlerts] = useState([
    { id: 1, text: 'New lead <strong>Alice Johnson</strong> assigned to you.' },
    { id: 2, text: 'Message received from Sales Manager.' },
    { id: 3, text: 'Your daily summary is ready.' }
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Follow-up scheduled at <strong>11:00 AM</strong>.' },
    { id: 2, text: 'Resolve ticket #234 today.' },
    { id: 3, text: 'Review team performance by 6 PM.' }
  ]);
  const [logs, setLogs] = useState([
    { id: 1, text: 'Admin edited Lead #102 · 09:13 AM' },
    { id: 2, text: 'John deleted Task #51' },
    { id: 3, text: 'Sarah updated Deal #A22' }
  ]);
  const [adminFeed, setAdminFeed] = useState([
    { id: 1, text: 'CRM update v4.2 deployed.' },
    { id: 2, text: 'Roles restructured by Admin.' },
    { id: 3, text: 'Security audit passed.' }
  ]);

  const removeNotification = (category, id) => {
    switch (category) {
      case 'alerts':
        setAlerts(alerts.filter(item => item.id !== id));
        break;
      case 'tasks':
        setTasks(tasks.filter(item => item.id !== id));
        break;
      case 'logs':
        setLogs(logs.filter(item => item.id !== id));
        break;
      case 'admin':
        setAdminFeed(adminFeed.filter(item => item.id !== id));
        break;
      default:
        break;
    }
  };

  return (
    <div className="notif-overlay">
      <div className="side-panel elegant">
        <div className="side-panel-header">
          <h3><FaBell style={{ marginRight: '8px' }} /> Notifications & Logs</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close notifications panel">
            <FaTimes />
          </button>
        </div>

        <div className="side-panel-body">
          <div className="notif-group">
            <h4><FaBell /> Real-Time Alerts</h4>
            {alerts.map(item => (
              <div key={item.id} className="notif-card">
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                <button
                  className="remove-btn"
                  onClick={() => removeNotification('alerts', item.id)}
                  aria-label="Remove notification"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <div className="notif-group">
            <h4><FaTasks /> Task Reminders</h4>
            {tasks.map(item => (
              <div key={item.id} className="notif-card">
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                <button
                  className="remove-btn"
                  onClick={() => removeNotification('tasks', item.id)}
                  aria-label="Remove task reminder"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <div className="notif-group">
            <h4><FaClipboardList /> Audit Logs</h4>
            {logs.map(item => (
              <div key={item.id} className="notif-log">
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                <button
                  className="remove-btn"
                  onClick={() => removeNotification('logs', item.id)}
                  aria-label="Remove audit log"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <div className="notif-group">
            <h4><FaUserShield /> Admin Feed</h4>
            {adminFeed.map(item => (
              <div key={item.id} className="notif-card">
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                <button
                  className="remove-btn"
                  onClick={() => removeNotification('admin', item.id)}
                  aria-label="Remove admin feed item"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;