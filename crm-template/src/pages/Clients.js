import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Clients.css';
import { FaPlus, FaEdit, FaTrash, FaFileUpload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Modal, Button, Form, Collapse } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const Clients = () => {
  const [clients, setClients] = useState(initialClients);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '', industry: '', contactPerson: '', email: '', phone: '', billingInfo: ''
  });
  const [newInteraction, setNewInteraction] = useState({ type: 'Call', date: '', notes: '' });
  const [newDocument, setNewDocument] = useState(null);
  const [newRelationship, setNewRelationship] = useState('');
  const [openTimeline, setOpenTimeline] = useState({});
  const [errors, setErrors] = useState({});
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!newClient.name) newErrors.name = 'Client name is required';
    if (!newClient.email || !/\S+@\S+\.\S+/.test(newClient.email)) newErrors.email = 'Valid email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction({ ...newInteraction, [name]: value });
  };

  const handleDocumentUpload = (e) => {
    setNewDocument(e.target.files[0]);
  };

  const handleRelationshipChange = (e) => {
    setNewRelationship(e.target.value);
  };

  const handleAddOrUpdateClient = () => {
    if (!validateForm()) return;
    if (editingId !== null) {
      setClients(clients.map((client) => client.id === editingId ? { ...newClient, id: editingId, documents: client.documents, interactions: client.interactions, relationships: client.relationships } : client));
    } else {
      setClients([...clients, { ...newClient, id: clients.length + 1, documents: [], interactions: [], relationships: [] }]);
    }
    setFormVisible(false);
    setEditingId(null);
    setNewClient({ name: '', industry: '', contactPerson: '', email: '', phone: '', billingInfo: '' });
    setErrors({});
  };

  const handleAddInteraction = (clientId) => {
    if (!newInteraction.date || !newInteraction.notes) return;
    setClients(clients.map((client) => 
      client.id === clientId 
        ? { ...client, interactions: [...client.interactions, { ...newInteraction, id: client.interactions.length + 1 }] }
        : client
    ));
    setNewInteraction({ type: 'Call', date: '', notes: '' });
  };

  const handleEditInteraction = (clientId, interaction) => {
    setEditingInteraction({ ...interaction, clientId });
    setShowInteractionModal(true);
  };

  const handleUpdateInteraction = () => {
    if (!newInteraction.date || !newInteraction.notes) return;
    setClients(clients.map((client) => 
      client.id === editingInteraction.clientId 
        ? {
            ...client,
            interactions: client.interactions.map((int) =>
              int.id === editingInteraction.id ? { ...newInteraction, id: int.id } : int
            )
          }
        : client
    ));
    setShowInteractionModal(false);
    setEditingInteraction(null);
    setNewInteraction({ type: 'Call', date: '', notes: '' });
  };

  const handleDeleteInteraction = (clientId, interactionId) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, interactions: client.interactions.filter((int) => int.id !== interactionId) }
          : client
      ));
    }
  };

  const handleAddDocument = (clientId) => {
    if (newDocument) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, documents: [...client.documents, newDocument.name] }
          : client
      ));
      setNewDocument(null);
      fileInputRef.current.value = null;
    }
  };

  const handleEditDocument = (clientId, oldDoc, newDoc) => {
    if (newDoc) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, documents: client.documents.map((doc) => doc === oldDoc ? newDoc.name : doc) }
          : client
      ));
      setNewDocument(null);
      fileInputRef.current.value = null;
    }
  };

  const handleDeleteDocument = (clientId, doc) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, documents: client.documents.filter((d) => d !== doc) }
          : client
      ));
    }
  };

  const handleAddOrUpdateRelationship = (clientId) => {
    if (!newRelationship) return;
    if (editingRelationship !== null) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, relationships: client.relationships.map((rel, index) => index === editingRelationship ? newRelationship : rel) }
          : client
      ));
    } else {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, relationships: [...client.relationships, newRelationship] }
          : client
      ));
    }
    setShowRelationshipModal(false);
    setEditingRelationship(null);
    setNewRelationship('');
  };

  const handleEditRelationship = (clientId, index, rel) => {
    setEditingRelationship(index);
    setNewRelationship(rel);
    setShowRelationshipModal(true);
  };

  const handleDeleteRelationship = (clientId, index) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      setClients(clients.map((client) => 
        client.id === clientId 
          ? { ...client, relationships: client.relationships.filter((_, i) => i !== index) }
          : client
      ));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter((client) => client.id !== id));
    }
  };

  const handleEdit = (client) => {
    setFormVisible(true);
    setEditingId(client.id);
    setNewClient({
      name: client.name,
      industry: client.industry,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      billingInfo: client.billingInfo
    });
  };

  const handleClose = () => {
    setFormVisible(false);
    setShowInteractionModal(false);
    setShowRelationshipModal(false);
    setEditingId(null);
    setEditingInteraction(null);
    setEditingRelationship(null);
    setNewClient({ name: '', industry: '', contactPerson: '', email: '', phone: '', billingInfo: '' });
    setNewInteraction({ type: 'Call', date: '', notes: '' });
    setNewRelationship('');
    setErrors({});
  };

  const toggleTimeline = (clientId) => {
    setOpenTimeline({ ...openTimeline, [clientId]: !openTimeline[clientId] });
  };

  return (
    <div className="clients-wrapper bg-gray-100 min-h-screen flex">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <div className="clients-content flex-1 p-6">
        <div className="clients-header mt-5 flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Client/Contact Management</h2>
          </div>
          <button 
            className="add-client-btn bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            onClick={() => setFormVisible(true)}
          >
            <FaPlus /> {editingId !== null ? 'Update Client' : 'Add New Client'}
          </button>
        </div>

        <Modal show={formVisible} onHide={handleClose} centered>
          <Modal.Header closeButton className="border-b-0">
            <Modal.Title className="text-lg font-semibold text-gray-800">
              {editingId !== null ? 'Update Client' : 'Add New Client'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter client name"
                  value={newClient.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Industry</Form.Label>
                <Form.Control
                  type="text"
                  name="industry"
                  placeholder="Enter industry"
                  value={newClient.industry}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Contact Person</Form.Label>
                <Form.Control
                  type="text"
                  name="contactPerson"
                  placeholder="Enter contact person"
                  value={newClient.contactPerson}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={newClient.phone}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Billing Info</Form.Label>
                <Form.Control
                  type="text"
                  name="billingInfo"
                  placeholder="Enter billing info"
                  value={newClient.billingInfo}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-t-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="px-4 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddOrUpdateClient}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              {editingId !== null ? 'Update Client' : 'Add Client'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showInteractionModal} onHide={handleClose} centered>
          <Modal.Header closeButton className="border-b-0">
            <Modal.Title className="text-lg font-semibold text-gray-800">
              {editingInteraction ? 'Update Interaction' : 'Add Interaction'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Type</Form.Label>
                <Form.Select
                  name="type"
                  value={newInteraction.type}
                  onChange={handleInteractionChange}
                  className="text-sm"
                >
                  <option>Call</option>
                  <option>Email</option>
                  <option>Message</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={newInteraction.date}
                  onChange={handleInteractionChange}
                  className="text-sm"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Notes</Form.Label>
                <Form.Control
                  type="text"
                  name="notes"
                  placeholder="Enter notes"
                  value={newInteraction.notes}
                  onChange={handleInteractionChange}
                  className="text-sm"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-t-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="px-4 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateInteraction}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
              disabled={!newInteraction.date || !newInteraction.notes}
            >
              {editingInteraction ? 'Update Interaction' : 'Add Interaction'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showRelationshipModal} onHide={handleClose} centered>
          <Modal.Header closeButton className="border-b-0">
            <Modal.Title className="text-lg font-semibold text-gray-800">
              {editingRelationship !== null ? 'Update Relationship' : 'Add Relationship'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-sm font-medium text-gray-700">Relationship</Form.Label>
                <Form.Control
                  type="text"
                  name="relationship"
                  placeholder="Enter relationship details"
                  value={newRelationship}
                  onChange={handleRelationshipChange}
                  className="text-sm"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-t-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="px-4 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleAddOrUpdateRelationship(editingInteraction?.clientId || clients[0]?.id)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
              disabled={!newRelationship}
            >
              {editingRelationship !== null ? 'Update Relationship' : 'Add Relationship'}
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="clients-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="client-card bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="client-info flex gap-4">
                <div className="client-avatar w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {client.name[0]}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-gray-800">{client.name}</h5>
                  <div className="badges flex gap-2 mt-1">
                    <span className="industry bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{client.industry}</span>
                    <span className="contact bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{client.contactPerson}</span>
                  </div>
                  <div className="contact-details text-gray-600 text-sm mt-1">
                    <span>{client.email}</span> | <span>{client.phone}</span>
                  </div>
                  <div className="billing text-gray-600 text-sm mt-1">Billing: {client.billingInfo}</div>
                </div>
              </div>
              <div className="client-actions mt-4">
                <div className="timeline">
                  <button 
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    onClick={() => toggleTimeline(client.id)}
                  >
                    Interaction Timeline {openTimeline[client.id] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <Collapse in={openTimeline[client.id]}>
                    <div>
                      {client.interactions.map((interaction) => (
                        <div key={interaction.id} className="interaction text-sm text-gray-600 mb-2 flex justify-between items-center">
                          <div>
                            <span className="font-medium">{interaction.date} - {interaction.type}</span>: {interaction.notes}
                          </div>
                          <div className="flex gap-2">
                            <FaEdit 
                              className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" 
                              onClick={() => handleEditInteraction(client.id, interaction)}
                            />
                            <FaTrash 
                              className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors" 
                              onClick={() => handleDeleteInteraction(client.id, interaction.id)}
                            />
                          </div>
                        </div>
                      ))}
                      <Form.Group className="mt-3">
                        <Form.Select
                          name="type"
                          value={newInteraction.type}
                          onChange={handleInteractionChange}
                          className="text-sm mb-2"
                        >
                          <option>Call</option>
                          <option>Email</option>
                          <option>Message</option>
                        </Form.Select>
                        <Form.Control
                          type="date"
                          name="date"
                          value={newInteraction.date}
                          onChange={handleInteractionChange}
                          className="text-sm mb-2"
                        />
                        <Form.Control
                          type="text"
                          name="notes"
                          placeholder="Enter notes"
                          value={newInteraction.notes}
                          onChange={handleInputChange}
                          className="text-sm mb-2"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAddInteraction(client.id)}
                          disabled={!newInteraction.date || !newInteraction.notes}
                        >
                          Add Interaction
                        </Button>
                      </Form.Group>
                    </div>
                  </Collapse>
                </div>
                <div className="documents mt-4">
                  <h6 className="text-sm font-medium text-gray-700">Documents</h6>
                  {client.documents.length ? (
                    client.documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center text-sm text-blue-600 hover:underline cursor-pointer">
                        <span>{doc}</span>
                        <div className="flex gap-2">
                          <Form.Control
                            type="file"
                            onChange={(e) => handleEditDocument(client.id, doc, e.target.files[0])}
                            accept=".pdf"
                            className="text-sm hidden"
                            id={`edit-doc-${client.id}-${index}`}
                          />
                          <label htmlFor={`edit-doc-${client.id}-${index}`}>
                            <FaEdit className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" />
                          </label>
                          <FaTrash 
                            className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors" 
                            onClick={() => handleDeleteDocument(client.id, doc)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No documents</p>
                  )}
                  <Form.Group className="mt-2">
                    <Form.Control
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDocumentUpload}
                      accept=".pdf"
                      className="text-sm"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      onClick={() => handleAddDocument(client.id)}
                      disabled={!newDocument}
                    >
                      <FaFileUpload /> Upload Document
                    </Button>
                  </Form.Group>
                </div>
                <div className="relationships mt-4">
                  <div className="flex justify-between items-center">
                    <h6 className="text-sm font-medium text-gray-700">Relationship Network</h6>
                    <button 
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setShowRelationshipModal(true)}
                    >
                      Add Relationship
                    </button>
                  </div>
                  <svg className="w-full h-20 mt-2" viewBox="0 0 200 80">
                    <circle cx="100" cy="40" r="20" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" />
                    <text x="100" y="45" textAnchor="middle" fill="#1f2937" fontSize="12">{client.name[0]}</text>
                    {client.relationships.map((rel, index) => (
                      <g key={index}>
                        <circle cx={100 + (index + 1) * 40} cy="40" r="15" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
                        <text x={100 + (index + 1) * 40} y="45" textAnchor="middle" fill="#1f2937" fontSize="10">{rel[0]}</text>
                        <line x1="100" y1="40" x2={100 + (index + 1) * 40} y2="40" stroke="#6b7280" strokeWidth="1" />
                        <g transform={`translate(${100 + (index + 1) * 40 - 20}, 20)`}>
                          <FaEdit 
                            className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" 
                            onClick={() => handleEditRelationship(client.id, index, rel)}
                            fontSize="12"
                          />
                          <FaTrash 
                            className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors ml-2" 
                            onClick={() => handleDeleteRelationship(client.id, index)}
                            fontSize="12"
                          />
                        </g>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="action-icons flex gap-3 mt-4">
                  <FaEdit 
                    title="Edit" 
                    className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" 
                    onClick={() => handleEdit(client)} 
                  />
                  <FaTrash 
                    title="Delete" 
                    className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors" 
                    onClick={() => handleDelete(client.id)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;