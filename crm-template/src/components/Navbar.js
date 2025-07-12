import { useEffect, useState } from 'react';
import './Navbar.css';
import { FaBell, FaCog } from 'react-icons/fa';
import NotificationsPanel from './NotificationsPanel';
import SettingsPanel from './SettingsPanel';

const CrNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
        setShowNotifications(false);
    };

    return (
        <>
            <div className={`crm-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-left">Introniq CRM Template</div>
                <div className="navbar-right">
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
