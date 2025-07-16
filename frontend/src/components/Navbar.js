import { useEffect, useState } from 'react';
import { FaBell, FaCog, FaUserCircle } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import NotificationsPanel from './NotificationsPanel';
import SettingsPanel from './SettingsPanel';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';

const CrNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowSettings(false);
        setShowProfileDropdown(false);
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
        setShowNotifications(false);
        setShowProfileDropdown(false);
    };

    const toggleProfile = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowNotifications(false);
        setShowSettings(false);
    };

    const role = user?.email === "snapgotit2005@gmail.com" ? "admin" : "viewer";

    return (
        <>
            <div className={`crm-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-left">Introniq CRM Template</div>

                <div className="navbar-right">
                <div className="profile-wrapper">
                    <FaUserCircle
                        className="navbar-icon"
                        title="Profile"
                        onClick={toggleProfile}
                    />
                    {showProfileDropdown && user && (
                        <div className="profile-dropdown">
                            <p><strong>{user.displayName || "No Name"}</strong></p>
                            <p>{user.email}</p>
                            <p className="profile-role">Role: {role}</p>
                            {role === "admin" && (
                                    <p
                                        className="profile-link"
                                        onClick={() => {
                                            setShowProfileDropdown(false);
                                            navigate('/dashboard');
                                        }}
                                        style={{
                                            color: "#3b82f6",
                                            cursor: "pointer",
                                            fontWeight: "500",
                                            marginTop: "10px"
                                        }}
                                    >
                                        Admin Settings
                                    </p>
                                )}
                        </div>
                    )}</div>
                    <FaBell className="navbar-icon" title="Notifications" onClick={toggleNotifications} />
                    <FaCog className="navbar-icon" title="Settings" onClick={toggleSettings} />
                </div>
            </div>

            {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        </>
    );
};

export default CrNavbar;