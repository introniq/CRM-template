import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import { FaClipboardList, FaDollarSign, FaUserPlus } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/Dashboard.css';
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import CrNavbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [leads, setLeads] = useState(0);
  const [deals, setDeals] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [salesFunnel, setSalesFunnel] = useState([
    { label: 'Prospect', value: 0, variant: 'prospecting' },
    { label: 'Proposal', value: 0, variant: 'proposal' },
    { label: 'Negotiation', value: 0, variant: 'negotiation' },
    { label: 'Closed', value: 0, variant: 'closed' },
  ]);
  const [revenueTrend, setRevenueTrend] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
      label: 'Revenue ($)',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: '#6366f1',
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 2,
    }],
  });
  const [hotLeads, setHotLeads] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Leads count
    const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const leadCount = snapshot.docs.length;
      setLeads(leadCount);
    }, (error) => {
      console.error("Error fetching leads:", error);
    });

    // Deals count and Sales Funnel
    const unsubscribeDeals = onSnapshot(collection(db, 'deals'), (snapshot) => {
      const dealCount = snapshot.docs.length;
      setDeals(dealCount);
      const stages = {
        'Prospect': 0,
        'Proposal': 0,
        'Negotiation': 0,
        'Closed': 0,
      };
      snapshot.docs.forEach(doc => {
        const stage = doc.data().stage || 'Prospect';
        if (stages.hasOwnProperty(stage)) {
          stages[stage]++;
        }
      });
      const funnelData = [
        { label: 'Prospect', value: dealCount ? (stages['Prospect'] / dealCount * 100).toFixed(0) : 0, variant: 'prospecting' },
        { label: 'Proposal', value: dealCount ? (stages['Proposal'] / dealCount * 100).toFixed(0) : 0, variant: 'proposal' },
        { label: 'Negotiation', value: dealCount ? (stages['Negotiation'] / dealCount * 100).toFixed(0) : 0, variant: 'negotiation' },
        { label: 'Closed', value: dealCount ? (stages['Closed'] / dealCount * 100).toFixed(0) : 0, variant: 'closed' },
      ];
      setSalesFunnel(funnelData);
    }, (error) => {
      console.error("Error fetching deals:", error);
    });

    // Hot Leads (top 3 by score, stage not 'Lost')
    const hotLeadsQuery = query(
      collection(db, 'leads'),
      where('stage', '!=', 'Lost'),
      orderBy('score', 'desc'),
      limit(3)
    );
    const unsubscribeHotLeads = onSnapshot(hotLeadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unknown',
        company: doc.data().company || 'N/A',
        score: doc.data().score || 0,
      }));
      setHotLeads(leadsData.length > 0 ? leadsData : [
        { id: '1', name: 'Jane Doe', company: 'Acme Corp', score: 50 },
        { id: '2', name: 'John Smith', company: 'Beta LLC', score: 50 },
        { id: '3', name: 'Emily Davis', company: 'Orbit Inc.', score: 50 },
      ]);
    }, (error) => {
      console.error("Error fetching hot leads:", error);
    });

    // Tasks count
    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskCount = snapshot.docs.length;
      setTasks(taskCount);
    }, (error) => {
      console.error("Error fetching tasks:", error);
    });

    // Revenue total and Revenue Trend
    const unsubscribeRevenue = onSnapshot(collection(db, 'revenue'), (snapshot) => {
      const totalRevenue = snapshot.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setRevenue(totalRevenue);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const revenueByMonth = months.map(() => 0);
      snapshot.docs.forEach(doc => {
        const month = doc.data().month;
        const index = months.indexOf(month);
        if (index !== -1) {
          revenueByMonth[index] += doc.data().amount || 0;
        }
      });
      setRevenueTrend({
        labels: months,
        datasets: [{
          label: 'Revenue ($)',
          data: revenueByMonth.length > 0 ? revenueByMonth : [4000, 4500, 6000, 7500, 8200, 10000, 12000, 14000, 16000],
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: '#6366f1',
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
        }],
      });
    }, (error) => {
      console.error("Error fetching revenue:", error);
    });

    // Recent Activity (last 3)
    const activityQuery = query(
      collection(db, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const activityData = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        return {
          id: doc.id,
          description: data.description || 'No description',
          createdAt,
        };
      }).filter(activity => activity.createdAt && activity.description);
      setRecentActivity(activityData.length > 0 ? activityData : [
        { id: '1', description: 'Created new task for client X', createdAt: new Date().toISOString() },
        { id: '2', description: 'Updated deal stage for Y', createdAt: new Date().toISOString() },
        { id: '3', description: 'Follow-up scheduled with Z', createdAt: new Date().toISOString() },
      ]);
    }, (error) => {
      console.error("Error fetching recent activity:", error);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeDeals();
      unsubscribeHotLeads();
      unsubscribeTasks();
      unsubscribeRevenue();
      unsubscribeActivity();
    };
  }, []);

  const logout = () => {
    auth.signOut();
    navigate("/");
  };

  const kpiData = [
    { icon: <FaUserPlus size={40} />, label: 'Leads', value: leads, color: 'linear-gradient(135deg, #6EE7B7, #3B82F6)', link: '/leads' },
    { icon: <FaClipboardList size={40} />, label: 'Deals', value: deals, color: 'linear-gradient(135deg, #FDE68A, #F59E0B)', link: '/deals' },
    { icon: <FaClipboardList size={40} />, label: 'Tasks', value: tasks, color: 'linear-gradient(135deg, #FBCFE8, #EC4899)', link: '/tasks' },
    { icon: <FaDollarSign size={40} />, label: 'Revenue', value: `$${revenue.toLocaleString()}`, color: 'linear-gradient(135deg, #C084FC, #8B5CF6)', link: '/reports' },
  ];

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="dashboard-wrapper bg-gray-100 min-h-screen flex">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <div className="dashboard-content flex-1 p-6">
        <CrNavbar logout={logout} />
        <Container fluid>
          <h4 className="mb-4 fw-semibold text-dark">Dashboard Overview</h4>

          <Row className="gx-4 gy-4 mb-5">
            {kpiData.map((item, index) => (
              <Col key={index} md={6} lg={6} xl={3}>
                <Card
                  className="kpi-card"
                  style={{ background: item.color }}
                  onClick={() => navigate(item.link)}
                >
                  <Card.Body className="text-white">
                    <div className="kpi-inner d-flex justify-content-between align-items-center gap-5">
                      <div>
                        <small className="text-light">{item.label}</small>
                        <h4 className="mb-0 fw-bold">{item.value}</h4>
                      </div>
                      <div className="icon-box">{item.icon}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="gx-5 gy-4 mb-3 align-items-stretch">
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">🧩 Sales Funnel</Card.Header>
                <Card.Body>
                  {salesFunnel.map((stage, index) => (
                    <div key={index} className="funnel-bar mb-4">
                      <div className="funnel-label d-flex justify-content-between">
                        <span>{stage.label}</span>
                        <span>{stage.value}%</span>
                      </div>
                      <ProgressBar
                        now={stage.value}
                        className={`progress-funnel ${stage.variant}`}
                        style={{ height: '12px', borderRadius: '30px' }}
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">📈 Revenue Trend</Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  <Line data={revenueTrend} options={revenueChartOptions} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="gx-5 gy-4">
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">🔥 This Week’s Hot Leads</Card.Header>
                <ListGroup variant="flush" className="fancy-list">
                  {hotLeads.length > 0 ? (
                    hotLeads.map((lead, index) => (
                      <ListGroup.Item key={index}>🚀 {lead.name} – {lead.company} (Score: {lead.score})</ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No hot leads available.</ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">📋 Recent Activity</Card.Header>
                <ListGroup variant="flush" className="fancy-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <ListGroup.Item key={index}>✅ {activity.description}</ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No recent activity available.</ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;