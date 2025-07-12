import './SidePanel.css';
import { FaTimes, FaWrench, FaUsersCog, FaEnvelopeOpenText, FaCogs, FaCode } from 'react-icons/fa';

const SettingsPanel = ({ onClose }) => {
  return (
    <div className="side-panel elegant">
      <div className="side-panel-header">
        <h3><FaWrench style={{ marginRight: '8px' }} /> Settings</h3>
        <button onClick={onClose} className="close-btn"><FaTimes /></button>
      </div>

      <div className="side-panel-body">

        <div className="notif-group">
          <h4><FaCogs /> Field Customization</h4>
          <div className="notif-card">Edit field labels, custom statuses, and lead tags.</div>
          <div className="notif-card">Configure stage progression logic and filters.</div>
        </div>

        <div className="notif-group">
          <h4><FaUsersCog /> User Roles & Permissions</h4>
          <div className="notif-card">Add/edit roles with granular module-level access.</div>
          <div className="notif-card">Define admin, manager, sales, and viewer roles.</div>
        </div>

        <div className="notif-group">
          <h4><FaEnvelopeOpenText /> Email & Workflow Templates</h4>
          <div className="notif-card">Customize auto-replies, drip campaigns, and templates.</div>
          <div className="notif-card">Create event-triggered automation workflows.</div>
        </div>

        <div className="notif-group">
          <h4><FaCode /> API & Webhook Configuration</h4>
          <div className="notif-card">Generate API keys with expiry and IP restrictions.</div>
          <div className="notif-card">Configure outbound webhooks for lead updates.</div>
        </div>
        
      </div>
    </div>
  );
};

export default SettingsPanel;
