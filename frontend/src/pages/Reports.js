import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Reports.css';
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';
import CrNavbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    const unsubscribeSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      setReportData((prev) => ({ ...prev, sales: snapshot.docs.map((doc) => doc.data()) }));
    }, (error) => console.error("Error fetching sales:", error));
    const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      setReportData((prev) => ({ ...prev, leads: snapshot.docs.map((doc) => doc.data()) }));
    }, (error) => console.error("Error fetching leads:", error));
    return () => {
      unsubscribeSales();
      unsubscribeLeads();
    };
  }, []);

  const renderReport = () => {
    switch (activeTab) {
      case 'sales':
        return <div className="report-section">Sales analytics: {reportData.sales?.length || 0} records</div>;
      case 'leads':
        return <div className="report-section">Lead sources: {reportData.leads?.length || 0} leads</div>;
      case 'conversion':
        return <div className="report-section">Insights into conversion rates and funnel efficiency.</div>;
      case 'retention':
        return <div className="report-section">Retention tracking, churn analysis, and renewal trends.</div>;
      case 'custom':
        return <div className="report-section">Custom report builder with filters, tags, and export options.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      <CrNavbar />
      <div className="reports-content mt-5">
        <div className="reports-header">
          <h2>CRM Reports & Analytics</h2>
        </div>
        <div className="tabs">
          <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'tab active' : 'tab'}>Sales</button>
          <button onClick={() => setActiveTab('leads')} className={activeTab === 'leads' ? 'tab active' : 'tab'}>Lead Sources</button>
          <button onClick={() => setActiveTab('conversion')} className={activeTab === 'conversion' ? 'tab active' : 'tab'}>Conversion</button>
          <button onClick={() => setActiveTab('retention')} className={activeTab === 'retention' ? 'tab active' : 'tab'}>Retention</button>
          <button onClick={() => setActiveTab('custom')} className={activeTab === 'custom' ? 'tab active' : 'tab'}>Custom Builder</button>
        </div>

        <div className="report-body">
          {renderReport()}
        </div>
        <div className="report-actions mt-3">
          <button className="export-btn"><FaFilePdf /> Export PDF</button>
          <button className="export-btn"><FaFileCsv /> Export CSV</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;