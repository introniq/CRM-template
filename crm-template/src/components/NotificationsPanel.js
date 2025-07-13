import '../styles/SidePanel.css';
import { FaTimes, FaBell, FaTasks, FaClipboardList, FaUserShield } from 'react-icons/fa';

const NotificationsPanel = ({ onClose }) => {
  return (
    <div className="notif-overlay">
      <div className="notif-side-panel">
        <div className="notif-header">
          <h3><FaBell style={{ marginRight: '8px' }} /> Notifications & Logs</h3>
          <button onClick={onClose} className="close-btn"><FaTimes /></button>
        </div>

        <div className="notif-body">
          <div className="notif-group">
            <h4><FaBell /> Real-Time Alerts</h4>
            <div className="notif-card">New lead <strong>Alice Johnson</strong> assigned to you.</div>
            <div className="notif-card">Message received from Sales Manager.</div>
            <div className="notif-card">Your daily summary is ready.</div>
          </div>

          <div className="notif-group">
            <h4><FaTasks /> Task Reminders</h4>
            <div className="notif-card">Follow-up scheduled at <strong>11:00 AM</strong>.</div>
            <div className="notif-card">Resolve ticket #234 today.</div>
            <div className="notif-card">Review team performance by 6 PM.</div>
          </div>

          <div className="notif-group">
            <h4><FaClipboardList /> Audit Logs</h4>
            <div className="notif-log">Admin edited Lead #102 · 09:13 AM</div>
            <div className="notif-log">John deleted Task #51</div>
            <div className="notif-log">Sarah updated Deal #A22</div>
          </div>

          <div className="notif-group">
            <h4><FaUserShield /> Admin Feed</h4>
            <div className="notif-card">CRM update v4.2 deployed.</div>
            <div className="notif-card">Roles restructured by Admin.</div>
            <div className="notif-card">Security audit passed.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
