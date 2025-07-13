import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Modal, Button, Form, Navbar } from 'react-bootstrap';
import { FaPlus, FaSync, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/Calendar.css';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const initialClients = [
  {
    id: 1,
    name: 'Acme Corp',
    industry: 'Technology',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.com',
    phone: '555-0123',
    billingInfo: 'Net 30, Invoice #1234',
    documents: ['contract.pdf'],
    interactions: [
      { id: 1, type: 'Call', date: '2025-07-10', notes: 'Discussed project scope' },
      { id: 2, type: 'Email', date: '2025-07-09', notes: 'Sent proposal' }
    ],
    relationships: ['Shared contact: Bob Singh (LinkedIn)', 'Met at TechConf 2024']
  },
  {
    id: 2,
    name: 'Beta Inc',
    industry: 'Finance',
    contactPerson: 'John Smith',
    email: 'john@beta.com',
    phone: '555-0456',
    billingInfo: 'Net 15, Invoice #5678',
    documents: [],
    interactions: [
      { id: 1, type: 'Message', date: '2025-07-08', notes: 'Follow-up on payment' }
    ],
    relationships: ['Referral from Alice Johnson']
  }
];

const ItemTypes = { TASK: 'task' };

const DraggableTask = ({ task, clientId }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { task, clientId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`task-item p-2 mb-2 bg-gray-100 rounded-lg flex justify-between items-center ${isDragging ? 'opacity-50' : ''}`}
    >
      <span>{task.notes} ({task.type})</span>
      <span className="text-xs text-gray-600">{task.date}</span>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState(
    initialClients.flatMap((client) =>
      client.interactions.map((interaction) => ({
        ...interaction,
        clientId: client.id,
        clientName: client.name,
      }))
    )
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    clientId: null,
    type: 'Meeting',
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewEvent({ title: '', start, end, clientId: null, type: 'Meeting' });
    setShowEventModal(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      clientId: event.clientId,
      type: event.type,
    });
    setShowEventModal(true);
  }, []);

  const handleDropEvent = useCallback((event, newStart) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id ? { ...ev, start: newStart, end: new Date(newStart.getTime() + (ev.end - ev.start)) } : ev
      )
    );
  }, []);

  const handleDropTask = useCallback((task, clientId, date) => {
    const newEvent = {
      id: events.length + 1,
      title: `${task.notes} (${task.type})`,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 1-hour duration
      clientId,
      clientName: initialClients.find((c) => c.id === clientId).name,
      type: task.type,
    };
    setEvents([...events, newEvent]);
  }, [events]);

  const EventWrapper = ({ event, children }) => {
    const [, drop] = useDrop(() => ({
      accept: ItemTypes.TASK,
      drop: (item, monitor) => {
        const { task, clientId } = item;
        const date = new Date(event.start);
        handleDropTask(task, clientId, date);
      },
    }));

    return <div ref={drop}>{children}</div>;
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddOrUpdateEvent = () => {
    if (!newEvent.title) return;
    if (editingEvent) {
      setEvents(
        events.map((ev) =>
          ev.id === editingEvent.id
            ? { ...ev, title: newEvent.title, start: new Date(newEvent.start), end: new Date(newEvent.end), clientId: newEvent.clientId, type: newEvent.type }
            : ev
        )
      );
    } else {
      setEvents([
        ...events,
        {
          id: events.length + 1,
          title: newEvent.title,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end),
          clientId: newEvent.clientId,
          clientName: newEvent.clientId ? initialClients.find((c) => c.id === newEvent.clientId)?.name : null,
          type: newEvent.type,
        },
      ]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
    setNewEvent({ title: '', start: new Date(), end: new Date(), clientId: null, type: 'Meeting' });
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((ev) => ev.id !== id));
    }
  };

  const handleSyncCalendar = (provider) => {
    // Placeholder for Google/Outlook sync
    alert(`Syncing with ${provider} Calendar... (API implementation required)`);
    // Example Google Calendar sync (requires googleapis package):
    // const { google } = require('googleapis');
    // const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    // oauth2Client.setCredentials({ access_token: ACCESS_TOKEN });
    // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // calendar.events.list({ calendarId: 'primary' }, (err, res) => { ... });
    // Example Outlook Calendar sync (requires @microsoft/microsoft-graph-client):
    // const client = require('@microsoft/microsoft-graph-client').Client.init({ authProvider: (done) => { done(null, ACCESS_TOKEN); } });
    // client.api('/me/events').get().then((res) => { ... });
    setShowSyncModal(false);
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.type === 'Meeting' ? '#2563eb' : event.type === 'Call' ? '#16a34a' : '#d97706';
    return { style: { backgroundColor, borderRadius: '8px', color: '#fff', border: 'none' } };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-wrapper bg-gray-100 min-h-screen flex">
        <div className="sidebar-fixed">
        <Sidebar />
        </div>
        <div className="calendar-content flex-1 p-6">
          <Navbar />
          <div className="calendar-header mt-5 flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
              <p className="text-gray-600 text-sm mt-1">Manage tasks and events with Google/Outlook sync</p>
            </div>
            <div className="flex gap-4">
              <button
                className="add-event-btn bg-blue-600 text-white mb-3 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                onClick={() => setShowEventModal(true)}
              >
                <FaPlus /> Add Event
              </button>
              <button
                className="sync-btn bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                onClick={() => setShowSyncModal(true)}
              >
                <FaSync /> Sync Calendars
              </button>
            </div>
          </div>

          <div className="calendar-container flex gap-6">
            <div className="task-list w-1/4 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h3>
              {tasks.map((task) => (
                <DraggableTask key={task.id} task={task} clientId={task.clientId} />
              ))}
            </div>
            <div className="calendar w-3/4">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                draggableAccessor={() => true}
                onEventDrop={({ event, start }) => handleDropEvent(event, start)}
                eventPropGetter={eventStyleGetter}
                components={{ eventWrapper: EventWrapper }}
              />
            </div>
          </div>

          <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
            <Modal.Header closeButton className="border-b-0">
              <Modal.Title className="text-lg font-semibold text-gray-800">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-6">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={handleEventChange}
                    className="text-sm"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Type</Form.Label>
                  <Form.Select name="type" value={newEvent.type} onChange={handleEventChange} className="text-sm">
                    <option>Meeting</option>
                    <option>Call</option>
                    <option>Task</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Start Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start"
                    value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={handleEventChange}
                    className="text-sm"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end"
                    value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={handleEventChange}
                    className="text-sm"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Link to Client</Form.Label>
                  <Form.Select
                    name="clientId"
                    value={newEvent.clientId || ''}
                    onChange={handleEventChange}
                    className="text-sm"
                  >
                    <option value="">No Client</option>
                    {initialClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {newEvent.clientId && (
                  <Button
                    variant="link"
                    className="text-blue-600 text-sm flex items-center gap-2"
                    onClick={() => navigate(`/clients#client-${newEvent.clientId}`)}
                  >
                    <FaExternalLinkAlt /> View Client Details
                  </Button>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-t-0">
              <Button
                variant="outline-secondary"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              {editingEvent && (
                <Button
                  variant="danger"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  <FaTrash /> Delete
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleAddOrUpdateEvent}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                disabled={!newEvent.title}
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)} centered>
            <Modal.Header closeButton className="border-b-0">
              <Modal.Title className="text-lg font-semibold text-gray-800">Sync Calendars</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Connect your Google or Outlook calendar to sync events.
              </p>
              <Button
                variant="primary"
                className="w-full mb-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={() => handleSyncCalendar('Google')}
              >
                Connect Google Calendar
              </Button>
              <Button
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={() => handleSyncCalendar('Outlook')}
              >
                Connect Outlook Calendar
              </Button>
            </Modal.Body>
            <Modal.Footer className="border-t-0">
              <Button
                variant="outline-secondary"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 rounded-lg"
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </DndProvider>
  );
};

export default CalendarPage;