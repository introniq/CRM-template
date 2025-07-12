import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/Calendar';
import Reports from './pages/Reports';
import Communication from './pages/Communication';
import CrNavbar from './components/Navbar';

function App() {
  return (
    <Router>
        <CrNavbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/communication" element={<Communication />} />
          </Routes>
    </Router>
  );
}

export default App;
