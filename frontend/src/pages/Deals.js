import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Deals.css';
import CrNavbar from '../components/Navbar';

const stages = ['Prospect', 'Proposal', 'Negotiation', 'Closed'];

const dealsData = [
  {
    id: 1,
    title: 'Premium Package',
    description: 'Access to premium features and support.',
    value: '$1,200',
    stage: 'Prospect',
    probability: 30,
    priority: 'High',
    closeDate: '2025-07-20',
    createdAt: '2025-07-01',
  },
  {
    id: 2,
    title: 'Startup Deal',
    description: 'Perfect for startups.',
    value: '$750',
    stage: 'Proposal',
    probability: 50,
    priority: 'Medium',
    closeDate: '2025-07-18',
    createdAt: '2025-06-25',
  },
  {
    id: 3,
    title: 'Enterprise Bundle',
    description: 'Custom solution for large clients.',
    value: '$5,000',
    stage: 'Negotiation',
    probability: 70,
    priority: 'High',
    closeDate: '2025-07-22',
    createdAt: '2025-06-15',
  },
  {
    id: 4,
    title: 'SMB Offer',
    description: 'Offer for small-medium businesses.',
    value: '$1,800',
    stage: 'Closed',
    probability: 100,
    priority: 'Low',
    closeDate: '2025-07-10',
    createdAt: '2025-06-10',
  },
];

const getDaysOld = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return diff;
};

const Deals = () => {
  return (
    <div className="deals-container">
      <Sidebar />
      <CrNavbar/>
      <main className="deals-main">
        <h2 className="deals-title">Deals Pipeline</h2>
        <div className="kanban-board">
          {stages.map((stage) => (
            <div key={stage} className="kanban-column">
              <h3 className="kanban-stage">{stage}</h3>
              {dealsData
                .filter((deal) => deal.stage === stage)
                .map((deal) => {
                  const aging = getDaysOld(deal.createdAt);
                  const isStalled = aging > 10 && stage !== 'Closed';

                  return (
                    <div key={deal.id} className={`deal-card-kanban ${isStalled ? 'stalled' : ''}`}>
                      <h4>{deal.title}</h4>
                      <p>{deal.description}</p>
                      <p><strong>Value:</strong> {deal.value}</p>
                      <p><strong>Probability:</strong> {deal.probability}%</p>
                      <p><strong>Priority:</strong> {deal.priority}</p>
                      <p><strong>Forecast Close:</strong> {deal.closeDate}</p>
                      <p><strong>Aging:</strong> {aging} days</p>
                      {isStalled && <span className="stalled-badge">⚠ Stalled</span>}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Deals;
