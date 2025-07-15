import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Communication.css';
import CrNavbar from '../components/Navbar';

const Communication = () => {
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('Hi {{name}}, hope you are doing well!');
  const [channel, setChannel] = useState({
    email: true,
    whatsapp: false,
    sms: false,
  });

  const emailHistory = [
    { to: 'john@example.com', subject: 'Welcome', status: 'Opened', time: '2 hours ago' },
    { to: 'team@client.com', subject: 'Meeting Invite', status: 'Clicked', time: 'Yesterday' },
    { to: 'hello@company.org', subject: 'Proposal Update', status: 'Sent', time: '2 days ago' },
  ];

  const toggleChannel = (type) => {
    setChannel({ ...channel, [type]: !channel[type] });
  };

  return (
    <div className="communication-container">
      <Sidebar />
      <CrNavbar/>
      <main className="communication-main">
        <h2 className="page-title">Email & Communication Center</h2>

        {/* Account integration */}
        <section className="integration-section">
          <h3>📩 Integrated Accounts</h3>
          <div className="integration-cards">
            <div className="account-card connected">Gmail Connected ✅</div>
            <div className="account-card disconnected">Outlook Not Connected ❌</div>
          </div>
        </section>

        {/* Compose */}
        <section className="compose-section">
          <h3>✉️ Compose Email</h3>
          <textarea
            rows="5"
            value={message || template}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          ></textarea>

          <div className="template-vars">
            <span>Variables: </span>
            <code>{`{name}`}</code> <code>{`{company}`}</code> <code>{`{date}`}</code>
          </div>

          <div className="channels">
            <label>
              <input type="checkbox" checked={channel.email} onChange={() => toggleChannel('email')} />
              Email
            </label>
            <label>
              <input type="checkbox" checked={channel.whatsapp} onChange={() => toggleChannel('whatsapp')} />
              WhatsApp
            </label>
            <label>
              <input type="checkbox" checked={channel.sms} onChange={() => toggleChannel('sms')} />
              SMS
            </label>
          </div>

          <button className="send-btn">Send Now</button>
          <button className="schedule-btn">📅 Schedule</button>
        </section>

        {/* Email history */}
        <section className="history-section">
          <h3>📜 Email Tracking</h3>
          <div className="email-history">
            {emailHistory.map((email, i) => (
              <div key={i} className="email-entry">
                <div>
                  <strong>To:</strong> {email.to}
                </div>
                <div>
                  <strong>Subject:</strong> {email.subject}
                </div>
                <div>
                  <span className={`status ${email.status.toLowerCase()}`}>{email.status}</span>
                  <span className="time">{email.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Communication;
