import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserFriends,
  FaHandshake,
  FaTasks,
  FaCalendarAlt,
  FaChartLine,
} from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
  { name: 'Leads', path: '/leads', icon: <FaUsers /> },
  { name: 'Clients / Contacts', path: '/clients', icon: <FaUserFriends /> },
  { name: 'Deals', path: '/deals', icon: <FaHandshake /> },
  { name: 'Tasks & Reminders', path: '/tasks', icon: <FaTasks /> },
  { name: 'Calendar', path: '/calendar', icon: <FaCalendarAlt /> },
  { name: 'Reports', path: '/reports', icon: <FaChartLine /> },
  { name: 'Communication', path: '/communication', icon: <FaUsers /> },
];

const Sidebar = () => {
  const getLinkStyle = (isActive) => ({
    ...styles.link,
    ...(isActive ? styles.activeLink : styles.inactiveLink),
  });

  const getIconStyle = (isActive) => ({
    ...styles.icon,
    color: isActive ? '#0ea5e9' : '#555',
  });

  return (
    <div style={styles.sidebar}>
      <h4 style={styles.title}>IntroNiQ Dashboard</h4>
      <hr style={styles.divider} />
      <div style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => getLinkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <span style={getIconStyle(isActive)}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

const styles = {
  sidebar: {
    width: '299px',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: `'Segoe UI', sans-serif`,
    overflowY: 'hidden',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    borderRight: '1px solid #dee2e6',
  },
  title: {
    textAlign: 'center',
    marginBottom: '25px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1.2rem',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 35px',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activeLink: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #e2e8f0',
    fontWeight: 'bold',
    color: '#000',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  inactiveLink: {
    color: '#555',
    fontWeight: 'normal',
  },
  icon: {
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    border: '0.5px solid #dee2e6',
    margin: '10px 0',
  },
};