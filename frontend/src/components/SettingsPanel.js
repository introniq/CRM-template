import '../styles/SettingPanel.css';
import {
  FaTimes,
  FaUserShield,
  FaUserEdit,
  FaEnvelope,
  FaKey,
  FaTrashAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SettingsPanel = ({ onClose }) => {
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailErrors, setEmailErrors] = useState([]);
  const navigate = useNavigate();

  const closeModal = () => {
    setModalType(null);
    setFormData({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors([]);
    setEmailErrors([]);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  const validateEmail = (email) => {
    const errors = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address (e.g., user@domain.com)');
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'newPassword') {
      setPasswordErrors(validatePassword(value));
    }
    if (name === 'email') {
      setEmailErrors(validateEmail(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'password' && (passwordErrors.length > 0 || formData.newPassword !== formData.confirmPassword)) {
      setPasswordErrors(formData.newPassword !== formData.confirmPassword ? ['Passwords do not match'] : passwordErrors);
      return;
    }
    if (modalType === 'email' && emailErrors.length > 0) {
      return;
    }
    closeModal();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('Failed to log out: ' + error.message);
    }
  };

  return (
    <div className="glass-panel">
      <div className="glass-header">
        <div className="glass-heading-icon">
          <FaUserShield className="settings-icon" />
          <h2>Account Settings</h2>
        </div>
        <button onClick={onClose} className="glass-close" aria-label="Close settings">
          <FaTimes />
        </button>
      </div>

      <div className="glass-scrollable-body">
        <div className="glass-options">
          <div className="glass-item" onClick={() => setModalType('name')}>
            <FaUserEdit className="glass-icon" /><span>Update Name</span>
          </div>
          <div className="glass-item" onClick={() => setModalType('email')}>
            <FaEnvelope className="glass-icon" /><span>Update Email</span>
          </div>
          <div className="glass-item" onClick={() => setModalType('password')}>
            <FaKey className="glass-icon" /><span>Change Password</span>
          </div>
        </div>

        <div className="glass-divider" />

        <div className="glass-options">
          <div className="glass-item danger" onClick={() => setModalType('delete')}>
            <FaTrashAlt className="glass-icon" /><span>Delete Account</span>
          </div>
          <div className="glass-item logout" onClick={handleLogout}>
            <FaSignOutAlt className="glass-icon" /><span>Logout</span>
          </div>
        </div>
      </div>

      {modalType && (
        <div className="glass-modal-overlay" onClick={closeModal}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'name' ? 'Update Name' :
                 modalType === 'email' ? 'Update Email' :
                 modalType === 'password' ? 'Change Password' : 'Delete Account'}
              </h3>
              <button className="glass-close" onClick={closeModal} aria-label="Close modal">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {modalType === 'name' && (
                <div>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter new name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button type="button" className="modal-save" onClick={handleSubmit}>Save</button>
                  </div>
                </div>
              )}
              {modalType === 'email' && (
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter new email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {emailErrors.length > 0 && (
                    <ul className="error-list">
                      {emailErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button
                      type="button"
                      className="modal-save"
                      onClick={handleSubmit}
                      disabled={emailErrors.length > 0}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              {modalType === 'password' && (
                <div>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="New password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {passwordErrors.length > 0 && (
                    <ul className="error-list">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button
                      type="button"
                      className="modal-save"
                      onClick={handleSubmit}
                      disabled={passwordErrors.length > 0 || formData.newPassword !== formData.confirmPassword}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              )}
              {modalType === 'delete' && (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button type="button" className="modal-delete">Delete Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;