import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Leads.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newLead, setNewLead] = useState({
    name: '', stage: 'New', source: 'LinkedIn', score: 50, nextStep: '', assignedTo: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const leadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeads(leadsData);
    }, (error) => console.error("Error fetching leads:", error));
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead({ ...newLead, [name]: value });
  };

  const logActivity = async (description) => {
    try {
      await addDoc(collection(db, 'activity'), {
        description,
        createdAt: Timestamp.fromDate(new Date()),
      });
      console.log('Activity logged:', description);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const handleAddOrUpdateLead = async () => {
    try {
      if (editingId !== null) {
        const leadRef = doc(db, 'leads', editingId);
        await updateDoc(leadRef, newLead);
        await logActivity(`Lead updated: ${newLead.name}`);
      } else {
        await addDoc(collection(db, 'leads'), newLead);
        await logActivity(`New lead added: ${newLead.name}`);
      }
      setFormVisible(false);
      setEditingId(null);
      setNewLead({ name: '', stage: 'New', source: 'LinkedIn', score: 50, nextStep: '', assignedTo: '' });
    } catch (error) {
      console.error("Error adding/updating lead:", error);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
      await logActivity(`Lead deleted: ${name}`);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleEdit = (lead) => {
    setFormVisible(true);
    setEditingId(lead.id);
    setNewLead({
      name: lead.name,
      stage: lead.stage,
      source: lead.source,
      score: lead.score,
      nextStep: lead.nextStep,
      assignedTo: lead.assignedTo
    });
  };

  const handleClose = () => {
    setFormVisible(false);
    setEditingId(null);
    setNewLead({ name: '', stage: 'New', source: 'LinkedIn', score: 50, nextStep: '', assignedTo: '' });
  };

  return (
    <div className="leads-wrapper">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <CrNavbar />
      <div className="leads-content mt-5">
        <div className="leads-header">
          <div>
            <h2>Lead Management</h2>
            <p className="subtitle">Track, score, and nurture your leads with ease</p>
          </div>
          <button className="add-lead-btn" onClick={() => setFormVisible(true)}>
            <FaPlus /> {editingId !== null ? 'Update Lead' : 'Add New Lead'}
          </button>
        </div>

        <Modal show={formVisible} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId !== null ? 'Update Lead' : 'Add New Lead'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Lead Name</Form.Label>
                <Form.Control
                  type="text"
                  name2="name"
                  placeholder="Lead Name"
                  value={newLead.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Stage</Form.Label>
                <Form.Select name="stage" value={newLead.stage} onChange={handleInputChange}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Converted</option>
                  <option>Lost</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Source</Form.Label>
                <Form.Select name="source" value={newLead.source} onChange={handleInputChange}>
                  <option>LinkedIn</option>
                  <option>Referral</option>
                  <option>Campaign</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Assigned To</Form.Label>
                <Form.Control
                  type="text"
                  name="assignedTo"
                  placeholder="Assigned To"
                  value={newLead.assignedTo}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Score</Form.Label>
                <Form.Control
                  type="number"
                  name="score"
                  placeholder="Score"
                  value={newLead.score}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Next Follow-up Step</Form.Label>
                <Form.Control
                  type="text"
                  name="nextStep"
                  placeholder="Next Follow-up Step"
                  value={newLead.nextStep}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddOrUpdateLead}>
              {editingId !== null ? 'Update Lead' : 'Add Lead'}
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="leads-grid">
          {leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="lead-info">
                <div className="lead-avatar">{lead.name[0]}</div>
                <div>
                  <h5>{lead.name}</h5>
                  <div className="badges">
                    <span className={`stage ${lead.stage.toLowerCase()}`}>{lead.stage}</span>
                    <span className={`source ${lead.source.toLowerCase()}`}>{lead.source}</span>
                  </div>
                  <div className="assign">Assigned to: {lead.assignedTo}</div>
                </div>
              </div>
              <div className="lead-actions">
                <span className="score">Score: {lead.score}</span>
                <span className="next-step">{lead.nextStep}</span>
                <div className="action-icons">
                  <FaEdit title="Edit" onClick={() => handleEdit(lead)} />
                  <FaTrash onClick={() => handleDelete(lead.id, lead.name)} title="Delete" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leads;