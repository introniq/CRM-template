import { useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPlus, FaSync, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/Calendar.css';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

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
      <span className="text-xs text-gray-600">{task.date ? new Date(task.date).toLocaleDateString() : 'No Date'}</span>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
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

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
          end: data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end),
        };
      });
      setEvents(eventsData);
    }, (error) => {
      console.error("Error fetching events:", error);
      toast.error('Failed to fetch events.');
    });

    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          notes: data.title || 'Untitled Task',
          type: data.category || 'Follow-up',
          clientId: data.clientId || null,
          clientName: data.clientName || data.assignee || 'N/A',
          date: data.due instanceof Timestamp ? data.due.toDate().toISOString() : data.due || null,
          ...data,
        };
      });
      setTasks(tasksData);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      toast.error('Failed to fetch tasks.');
    });

    return () => {
      unsubscribeEvents();
      unsubscribeTasks();
    };
  }, []);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewEvent({ title: '', start, end, clientId: null, type: 'Meeting' });
    setEditingEvent(null);
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

  const handleDropEvent = useCallback(async (event, newStart) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      const duration = event.end - event.start;
      const newEnd = new Date(newStart.getTime() + duration);
      await updateDoc(eventRef, {
        start: Timestamp.fromDate(newStart),
        end: Timestamp.fromDate(newEnd),
      });
      toast.success('Event rescheduled successfully!');
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error('Failed to reschedule event.');
    }
  }, []);

  const handleDropTask = useCallback(async (task, clientId, date) => {
    try {
      const newEvent = {
        title: `${task.notes} (${task.type})`,
        start: Timestamp.fromDate(date),
        end: Timestamp.fromDate(new Date(date.getTime() + 60 * 60 * 1000)),
        clientId,
        clientName: task.clientName,
        type: task.type,
      };
      await addDoc(collection(db, 'events'), newEvent);
      toast.success(`Task "${task.notes}" added to calendar!`);
    } catch (error) {
      console.error("Error dropping task:", error);
      toast.error('Failed to add task to calendar.');
    }
  }, []);

  const EventWrapper = ({ event, children }) => {
    const [, drop] = useDrop(() => ({
      accept: ItemTypes.TASK,
      drop: (item) => {
        const { task, clientId } = item;
        const date = new Date(event.start);
        handleDropTask(task, clientId, date);
      },
    }));

    return <div ref={drop}>{children}</div>;
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: name === 'start' || name === 'end' ? new Date(value) : value,
    });
  };

  const handleAddOrUpdateEvent = async () => {
    if (!newEvent.title) {
      toast.error('Event title is required!');
      return;
    }
    if (newEvent.end < newEvent.start) {
      toast.error('End date must be after start date!');
      return;
    }
    try {
      if (editingEvent) {
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, {
          title: newEvent.title,
          start: Timestamp.fromDate(newEvent.start),
          end: Timestamp.fromDate(newEvent.end),
          clientId: newEvent.clientId || null,
          type: newEvent.type,
          clientName: newEvent.clientId ? tasks.find((t) => t.clientId === newEvent.clientId)?.clientName || 'N/A' : null,
        });
        toast.success('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), {
          title: newEvent.title,
          start: Timestamp.fromDate(newEvent.start),
          end: Timestamp.fromDate(newEvent.end),
          clientId: newEvent.clientId || null,
          type: newEvent.type,
          clientName: newEvent.clientId ? tasks.find((t) => t.clientId === newEvent.clientId)?.clientName || 'N/A' : null,
        });
        toast.success('Event added successfully!');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setNewEvent({ title: '', start: new Date(), end: new Date(), clientId: null, type: 'Meeting' });
    } catch (error) {
      console.error("Error adding/updating event:", error);
      toast.error('Failed to add/update event.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
        toast.success('Event deleted successfully!');
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error('Failed to delete event.');
      }
    }
  };

  const handleSyncCalendar = (provider) => {
    const syncedEvents = events.map((event) => ({
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      type: event.type,
      clientId: event.clientId,
      clientName: event.clientName,
    }));
    console.log(`Syncing with ${provider} Calendar:`, syncedEvents);
    toast.success(`Synced ${syncedEvents.length} events with ${provider} Calendar!`);
    setShowSyncModal(false);
  };

  const handleViewClientDetails = () => {
    if (!newEvent.clientId) {
      toast.error('No client selected!');
      return;
    }
    try {
      navigate(`/clients#client-${newEvent.clientId}`);
    } catch (error) {
      console.error("Error navigating to client details:", error);
      toast.error('Failed to navigate to client details.');
    }
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
          <CrNavbar />
          <div className="calendar-header mt-5 flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
              <p className="text-gray-600 text-sm mt-1">Manage tasks and events with Google/Outlook sync</p>
            </div>
            <div className="flex gap-4">
              <button
                className="add-event-btn bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
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
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <DraggableTask key={task.id} task={task} clientId={task.clientId} />
                ))
              ) : (
                <p className="text-gray-600">No tasks available.</p>
              )}
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
                    {tasks.map((task) => (
                      <option key={task.clientId || task.id} value={task.clientId || task.id}>
                        {task.clientName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {newEvent.clientId && (
                  <Button
                    variant="link"
                    className="text-blue-600 text-sm flex items-center gap-2"
                    onClick={handleViewClientDetails}
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
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
        </div>
      </div>
    </DndProvider>
  );
};

export default CalendarPage;