import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import sgMail from '@sendgrid/mail';
import Sidebar from '../components/Sidebar';
import '../styles/Communication.css';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';

// Configure SendGrid API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY || 'your-sendgrid-api-key');

const Communication = () => {
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('Hi {{name}}, hope you are doing well!');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [channel, setChannel] = useState({
    email: true,
    whatsapp: false,
    sms: false,
  });
  const [emailHistory, setEmailHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [integrations, setIntegrations] = useState({
    gmail: true,
    outlook: false,
  });

  useEffect(() => {
    const unsubscribeComms = onSnapshot(collection(db, 'communications'), (snapshot) => {
      const historyData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time instanceof Timestamp ? doc.data().time.toDate().toISOString() : doc.data().time,
      }));
      console.log('Fetched communications:', historyData);
      setEmailHistory(historyData);
    }, (error) => {
      console.error("Error fetching communication history:", error);
      toast.error('Failed to fetch communication history.');
    });

    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        clientName: doc.data().clientName || doc.data().assignee || 'N/A',
      }));
      console.log('Fetched tasks:', tasksData);
      setTasks(tasksData);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      toast.error('Failed to fetch tasks.');
    });

    const unsubscribeIntegrations = onSnapshot(collection(db, 'integrations'), (snapshot) => {
      const integrationsData = snapshot.empty
        ? { gmail: true, outlook: false }
        : snapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().connected }), {});
      console.log('Fetched integrations:', integrationsData);
      setIntegrations(integrationsData);
    }, (error) => {
      console.error("Error fetching integrations:", error);
      toast.error('Failed to fetch integrations.');
    });

    return () => {
      unsubscribeComms();
      unsubscribeTasks();
      unsubscribeIntegrations();
    };
  }, []);

  const toggleChannel = (type) => {
    setChannel({ ...channel, [type]: !channel[type] });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = async () => {
    if (!recipient) {
      toast.error('Recipient email is required!');
      return;
    }
    if (!validateEmail(recipient)) {
      toast.error('Invalid email address!');
      return;
    }
    if (!message && !template) {
      toast.error('Message or template is required!');
      return;
    }
    if (!Object.values(channel).some((c) => c)) {
      toast.error('At least one channel must be selected!');
      return;
    }
    try {
      const selectedTaskData = tasks.find((task) => task.id === selectedTask);
      const finalMessage = message || template;
      const commData = {
        to: recipient,
        subject: subject || 'New Message',
        message: finalMessage,
        status: 'Sent',
        time: Timestamp.fromDate(new Date()),
        channels: Object.keys(channel).filter((key) => channel[key]),
        clientId: selectedTaskData?.clientId || null,
        clientName: selectedTaskData?.clientName || null,
        taskId: selectedTask || null,
      };

      // Send Email via SendGrid if selected
      if (channel.email) {
        await sgMail.send({
          to: recipient,
          from: 'your-verified-email@example.com', // Replace with your verified SendGrid sender email
          subject: commData.subject,
          text: finalMessage,
        });
        console.log(`Email sent to ${recipient}`);
      }

      // Simulate WhatsApp/SMS
      if (channel.whatsapp) {
        console.log(`Simulating WhatsApp message to ${recipient}: ${finalMessage}`);
      }
      if (channel.sms) {
        console.log(`Simulating SMS to ${recipient}: ${finalMessage}`);
      }

      // Save to Firestore
      await addDoc(collection(db, 'communications'), commData);
      toast.success('Message sent successfully!');
      setMessage('');
      setRecipient('');
      setSubject('');
      setSelectedTask('');
    } catch (error) {
      console.error("Error sending communication:", error);
      toast.error(`Failed to send message: ${error.message}`);
    }
  };

  const handleScheduleEmail = async () => {
    if (!recipient) {
      toast.error('Recipient email is required!');
      return;
    }
    if (!validateEmail(recipient)) {
      toast.error('Invalid email address!');
      return;
    }
    if (!message && !template) {
      toast.error('Message or template is required!');
      return;
    }
    if (!Object.values(channel).some((c) => c)) {
      toast.error('At least one channel must be selected!');
      return;
    }
    if (!scheduleDate) {
      toast.error('Schedule date is required!');
      return;
    }
    const scheduleTime = new Date(scheduleDate);
    if (scheduleTime <= new Date()) {
      toast.error('Schedule date must be in the future!');
      return;
    }
    try {
      const selectedTaskData = tasks.find((task) => task.id === selectedTask);
      await addDoc(collection(db, 'communications'), {
        to: recipient,
        subject: subject || 'New Message',
        message: message || template,
        status: 'Scheduled',
        time: Timestamp.fromDate(scheduleTime),
        channels: Object.keys(channel).filter((key) => channel[key]),
        clientId: selectedTaskData?.clientId || null,
        clientName: selectedTaskData?.clientName || null,
        taskId: selectedTask || null,
      });
      toast.success('Message scheduled successfully!');
      setShowScheduleModal(false);
      setMessage('');
      setRecipient('');
      setSubject('');
      setSelectedTask('');
      setScheduleDate('');
    } catch (error) {
      console.error("Error scheduling communication:", error);
      toast.error(`Failed to schedule message: ${error.message}`);
    }
  };

  return (
    <div className="communication-container bg-gray-100 min-h-screen flex">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <div className="communication-content flex-1 p-6">
        <CrNavbar />
        <main className="communication-main mt-5">
          <h2 className="page-title text-2xl font-bold text-gray-800">Email & Communication Center</h2>

          <section className="integration-section mb-6">
            <h3 className="section-title text-lg font-semibold text-gray-800 mb-4">📩 Integrated Accounts</h3>
            <div className="integration-cards flex gap-4">
              <div className={`account-card p-4 rounded-lg shadow-md ${integrations.gmail ? 'connected bg-green-100' : 'disconnected bg-red-100'}`}>
                Gmail {integrations.gmail ? 'Connected ✅' : 'Not Connected ❌'}
              </div>
              <div className={`account-card p-4 rounded-lg shadow-md ${integrations.outlook ? 'connected bg-green-100' : 'disconnected bg-red-100'}`}>
                Outlook {integrations.outlook ? 'Connected ✅' : 'Not Connected ❌'}
              </div>
            </div>
          </section>

          <section className="compose-section mb-6 bg-white p-4 rounded-lg shadow-md">
            <h3 className="section-title text-lg font-semibold text-gray-800 mb-4">✉️ Compose Message</h3>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Recipient Email</Form.Label>
                <Form.Control
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient email"
                  className="text-sm rounded-lg"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="text-sm rounded-lg"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Link to Task/Client</Form.Label>
                <Form.Select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="text-sm rounded-lg"
                >
                  <option value="">No Task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.clientName})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={message || template}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="text-sm rounded-lg"
                />
              </Form.Group>
              <div className="template-vars mb-4">
                <span className="text-sm text-gray-600">Variables: </span>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">{`{name}`}</code>{' '}
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">{`{company}`}</code>{' '}
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">{`{date}`}</code>
              </div>
              <div className="channels flex gap-4 mb-4">
                {['email', 'whatsapp', 'sms'].map((type) => (
                  <label key={type} className="channel-label flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={channel[type]}
                      onChange={() => toggleChannel(type)}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
              <div className="compose-actions flex gap-4">
                <Button
                  className="send-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleSendEmail}
                >
                  Send Now
                </Button>
                <Button
                  className="schedule-btn px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowScheduleModal(true)}
                >
                  📅 Schedule
                </Button>
              </div>
            </Form>
          </section>

          <section className="history-section">
            <h3 className="section-title text-lg font-semibold text-gray-800 mb-4">📜 Communication History</h3>
            <div className="email-history bg-white p-4 rounded-lg shadow-md">
              {emailHistory.length > 0 ? (
                emailHistory.map((comm) => (
                  <div key={comm.id} className="email-entry p-3 mb-2 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <strong>To:</strong> {comm.to}
                    </div>
                    <div className="text-sm">
                      <strong>Subject:</strong> {comm.subject}
                    </div>
                    <div className="text-sm">
                      <strong>Message:</strong> {comm.message}
                    </div>
                    {comm.taskId && (
                      <div className="text-sm">
                        <strong>Task:</strong> {tasks.find((t) => t.id === comm.taskId)?.title || 'N/A'}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className={`status ${comm.status.toLowerCase()} px-2 py-1 rounded text-xs ${comm.status === 'Sent' ? 'bg-blue-100 text-blue-800' : comm.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {comm.status}
                      </span>
                      <span className="time text-gray-600 ml-2">{new Date(comm.time).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-history text-gray-600">No communication history available.</p>
              )}
            </div>
          </section>

          <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
            <Modal.Header closeButton className="border-b-0">
              <Modal.Title className="text-lg font-semibold text-gray-800">Schedule Message</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-6">
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Schedule Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="text-sm rounded-lg"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-t-0">
              <Button
                variant="outline-secondary"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleScheduleEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule
              </Button>
            </Modal.Footer>
          </Modal>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
        </main>
      </div>
    </div>
  );
};

export default Communication;