import { Container, Row, Col, Card, ListGroup, ProgressBar, Navbar } from 'react-bootstrap';
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
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const kpiData = [
    {
      icon: <FaUserPlus size={40} />,
      label: 'Leads',
      value: '128',
      color: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
      link: '/leads',
    },
    {
      icon: <FaClipboardList size={40} />,
      label: 'Deals',
      value: '34',
      color: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
      link: '/deals',
    },
    {
      icon: <FaClipboardList size={40} />,
      label: 'Tasks',
      value: '76',
      color: 'linear-gradient(135deg, #FBCFE8, #EC4899)',
      link: '/tasks',
    },
    {
      icon: <FaDollarSign size={40} />,
      label: 'Revenue',
      value: '$42,000',
      color: 'linear-gradient(135deg, #C084FC, #8B5CF6)',
      link: '/reports',
    },
  ];

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [4000, 4500, 6000, 7500, 8200, 10000, 12000, 14000, 16000],
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <div className="dashboard-content mt-5">
        
        <Container fluid>
          <h4 className="mb-4 fw-semibold text-dark">Dashboard Overview</h4>

          {/* KPI Cards */}
          <Row className="gx-4 gy-4 mb-5">
            {kpiData.map((item, index) => (
              <Col key={index} md={6} lg={6} xl={3}>
                <Card
                  className="kpi-card"
                  style={{ background: item.color }}
                  onClick={() => window.location.href = item.link}
                >
                  <Card.Body className="text-white">
                    <div className="kpi-inner d-flex justify-content-between align-items-center gap-5">
                      <div>
                        <small className="text-light">{item.label}</small>
                        <h4 className="mb-0 fw-bold">{item.value}</h4>
                      </div>
                      <div className="icon-box">
                        {item.icon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Sales Funnel + Revenue */}
          <Row className="gx-5 gy-4 mb-3 align-items-stretch">
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">🧩 Sales Funnel</Card.Header>
                <Card.Body>
                  {[
                    { label: 'Prospecting', value: 40, variant: 'prospecting' },
                    { label: 'Proposal Sent', value: 30, variant: 'proposal' },
                    { label: 'Negotiation', value: 20, variant: 'negotiation' },
                    { label: 'Closed Deal', value: 10, variant: 'closed' },
                  ].map((stage, index) => (
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
                  <Line data={revenueChartData} options={revenueChartOptions} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Hot Leads + Activity */}
          <Row className="gx-5 gy-4">
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">🔥 This Week’s Hot Leads</Card.Header>
                <ListGroup variant="flush" className="fancy-list">
                  <ListGroup.Item>🚀 Jane Doe – Acme Corp</ListGroup.Item>
                  <ListGroup.Item>⭐ John Smith – Beta LLC</ListGroup.Item>
                  <ListGroup.Item>📈 Emily Davis – Orbit Inc.</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="fancy-card h-100">
                <Card.Header className="bg-white fw-semibold">📋 Recent Activity</Card.Header>
                <ListGroup variant="flush" className="fancy-list">
                  <ListGroup.Item>✅ Created new task for client X</ListGroup.Item>
                  <ListGroup.Item>🔄 Updated deal stage for Y</ListGroup.Item>
                  <ListGroup.Item>📅 Follow-up scheduled with Z</ListGroup.Item>
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
