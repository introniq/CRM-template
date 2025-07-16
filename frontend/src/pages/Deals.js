import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import '../styles/Deals.css';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const stages = ['Prospect', 'Proposal', 'Negotiation', 'Closed'];

const getDaysOld = (createdAt, closeDate) => {
  try {
    let createdDate;
    if (createdAt instanceof Timestamp) {
      createdDate = createdAt.toDate();
    } else if (typeof createdAt === 'string' && !isNaN(new Date(createdAt).getTime())) {
      createdDate = new Date(createdAt);
    } else {
      throw new Error('Invalid createdAt format');
    }
    if (isNaN(createdDate.getTime())) {
      throw new Error('Invalid date parsed from createdAt');
    }
    const now = new Date();
    const diff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    if (diff === 0 && closeDate && !isNaN(new Date(closeDate).getTime())) {
      const closeDateObj = new Date(closeDate);
      const fallbackDiff = Math.floor((now - closeDateObj) / (1000 * 60 * 60 * 24));
      console.log('Using closeDate as fallback for aging:', { closeDate, fallbackDiff });
      return Math.max(0, fallbackDiff);
    }
    console.log('Aging calculation:', {
      createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : createdAt,
      createdDate: createdDate.toISOString(),
      now: now.toISOString(),
      diff,
    });
    return Math.max(0, diff);
  } catch (error) {
    console.error('Error calculating days old:', error, { createdAt, closeDate });
    if (closeDate && !isNaN(new Date(closeDate).getTime())) {
      const closeDateObj = new Date(closeDate);
      const fallbackDiff = Math.floor((new Date() - closeDateObj) / (1000 * 60 * 60 * 24));
      console.log('Fallback to closeDate:', { closeDate, fallbackDiff });
      return Math.max(0, fallbackDiff);
    }
    return 0;
  }
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'Prospect',
    probability: 0,
    priority: 'Medium',
    closeDate: '',
    createdAt: Timestamp.fromDate(new Date()),
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'deals'), (snapshot) => {
      const dealsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        let normalizedCreatedAt;
        if (data.createdAt instanceof Timestamp) {
          normalizedCreatedAt = data.createdAt;
        } else if (typeof data.createdAt === 'string' && !isNaN(new Date(data.createdAt).getTime())) {
          normalizedCreatedAt = Timestamp.fromDate(new Date(data.createdAt));
        } else {
          console.warn('Invalid or missing createdAt for deal:', doc.id, data.createdAt);
          normalizedCreatedAt = data.closeDate && !isNaN(new Date(data.closeDate).getTime())
            ? Timestamp.fromDate(new Date(data.closeDate))
            : Timestamp.fromDate(new Date());
          console.log('Set createdAt to:', normalizedCreatedAt.toDate().toISOString());
        }
        const now = new Date();
        const createdDate = normalizedCreatedAt.toDate();
        const closeDate = data.closeDate ? new Date(data.closeDate) : null;
        if (closeDate && !isNaN(closeDate.getTime()) && (now - createdDate) < 24 * 60 * 60 * 1000 && closeDate < now) {
          console.log('Correcting recent createdAt using closeDate:', {
            id: doc.id,
            createdAt: createdDate.toISOString(),
            closeDate: closeDate.toISOString(),
          });
          normalizedCreatedAt = Timestamp.fromDate(closeDate);
        }
        return {
          id: doc.id,
          ...data,
          createdAt: normalizedCreatedAt,
        };
      });
      console.log('Fetched deals:', dealsData.map((deal) => ({
        id: deal.id,
        title: deal.title,
        createdAt: deal.createdAt instanceof Timestamp ? deal.createdAt.toDate().toISOString() : deal.createdAt,
        closeDate: deal.closeDate,
      })));
      setDeals(dealsData);
    }, (error) => console.error("Error fetching deals:", error));
    return () => unsubscribe();
  }, []);

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

  const handleDealChange = (e) => {
    const { name, value } = e.target;
    setNewDeal({ ...newDeal, [name]: value });
  };

  const handleAddOrUpdateDeal = async () => {
    if (!newDeal.title) {
      alert('Deal title is required!');
      return;
    }
    try {
      const dealData = {
        ...newDeal,
        createdAt: editingDealId ? newDeal.createdAt : Timestamp.fromDate(new Date()),
        probability: parseInt(newDeal.probability) || 0,
      };
      console.log('Saving deal:', dealData, { editingDealId });
      if (editingDealId) {
        const dealRef = doc(db, 'deals', editingDealId);
        await updateDoc(dealRef, dealData);
        await logActivity(`Deal updated: ${newDeal.title}`);
      } else {
        await addDoc(collection(db, 'deals'), dealData);
        await logActivity(`New deal added: ${newDeal.title}`);
      }
      setShowAddDealModal(false);
      setEditingDealId(null);
      setNewDeal({
        title: '',
        description: '',
        value: '',
        stage: 'Prospect',
        probability: 0,
        priority: 'Medium',
        closeDate: '',
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error("Error adding/updating deal:", error);
      alert('Failed to add/update deal.');
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDealId(deal.id);
    setNewDeal({
      title: deal.title || '',
      description: deal.description || '',
      value: deal.value || '',
      stage: deal.stage || 'Prospect',
      probability: deal.probability || 0,
      priority: deal.priority || 'Medium',
      closeDate: deal.closeDate || '',
      createdAt: deal.createdAt || Timestamp.fromDate(new Date()),
    });
    setShowAddDealModal(true);
  };

  const handleDeleteDeal = async (dealId, title) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDoc(doc(db, 'deals', dealId));
        await logActivity(`Deal deleted: ${title}`);
      } catch (error) {
        console.error("Error deleting deal:", error);
        alert('Failed to delete deal.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddDealModal(false);
    setEditingDealId(null);
    setNewDeal({
      title: '',
      description: '',
      value: '',
      stage: 'Prospect',
      probability: 0,
      priority: 'Medium',
      closeDate: '',
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  return (
    <div className="deals-container bg-gray-100 min-h-screen flex">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <div className="deals-content flex-1 p-6">
        <CrNavbar />
        <main className="deals-main mt-5">
          <div className="deals-header flex justify-between items-center mb-6">
            <h2 className="deals-title text-2xl font-bold text-gray-800">Deals Pipeline</h2>
            <button
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => setShowAddDealModal(true)}
            >
              <FaPlus /> Add New Deal
            </button>
          </div>

          <Modal show={showAddDealModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton className="border-b-0">
              <Modal.Title className="text-lg font-semibold text-gray-800">
                {editingDealId ? 'Edit Deal' : 'Add New Deal'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-6">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Enter deal title"
                    value={newDeal.title}
                    onChange={handleDealChange}
                    className="text-sm rounded-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Enter deal description"
                    value={newDeal.description}
                    onChange={handleDealChange}
                    className="text-sm rounded-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Value</Form.Label>
                  <Form.Control
                    type="text"
                    name="value"
                    placeholder="Enter deal value (e.g., $1,200)"
                    value={newDeal.value}
                    onChange={handleDealChange}
                    className="text-sm rounded-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Stage</Form.Label>
                  <Form.Select name="stage" value={newDeal.stage} onChange={handleDealChange} className="text-sm rounded-lg">
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Probability (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="probability"
                    placeholder="Enter probability (0-100)"
                    value={newDeal.probability}
                    onChange={handleDealChange}
                    min="0"
                    max="100"
                    className="text-sm rounded-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Priority</Form.Label>
                  <Form.Select name="priority" value={newDeal.probability} onChange={handleDealChange} className="text-sm rounded-lg">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-sm font-medium text-gray-700">Close Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="closeDate"
                    value={newDeal.closeDate}
                    onChange={handleDealChange}
                    className="text-sm rounded-lg"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-t-0">
              <Button
                variant="outline-secondary"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddOrUpdateDeal}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                disabled={!newDeal.title}
              >
                {editingDealId ? 'Update Deal' : 'Add Deal'}
              </Button>
            </Modal.Footer>
          </Modal>

          <div className="kanban-board">
            {stages.map((stage) => (
              <div key={stage} className="kanban-column">
                <h3 className="kanban-stage text-lg font-semibold text-gray-800">{stage}</h3>
                <div className="kanban-column-content">
                  {deals
                    .filter((deal) => deal.stage === stage)
                    .map((deal) => {
                      const aging = getDaysOld(deal.createdAt, deal.closeDate);
                      const isStalled = aging > 10 && stage !== 'Closed';

                      return (
                        <div
                          key={deal.id}
                          className={`deal-card-kanban p-4 mb-3 bg-white rounded-lg shadow-md ${isStalled ? 'stalled border-red-300' : ''} priority-${deal.priority.toLowerCase()}`}
                        >
                          <div className="deal-card-header flex justify-between items-center">
                            <h4 className="text-base font-semibold">{deal.title}</h4>
                            <span className={`priority-badge priority-${deal.priority.toLowerCase()} text-xs px-2 py-1 rounded`}>
                              {deal.priority}
                            </span>
                          </div>
                          <p className="deal-description text-sm text-gray-600">{deal.description}</p>
                          <div className="deal-details text-sm">
                            <p><strong>Value:</strong> {deal.value}</p>
                            <p><strong>Probability:</strong> {deal.probability}%</p>
                            <p><strong>Forecast Close:</strong> {deal.closeDate}</p>
                            <p><strong>Aging:</strong> {aging} days</p>
                          </div>
                          {isStalled && <span className="stalled-badge text-xs text-red-600">⚠ Stalled</span>}
                          <div className="deal-actions flex gap-2 mt-3">
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => handleEditDeal(deal)}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              style={{
                                background: '#dc3545',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#c82333';
                                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#dc3545';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => handleDeleteDeal(deal.id, deal.title)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Deals;