import Sidebar from '../components/Sidebar'

const Deals = () => {
  return (
    <div style={{ display: 'flex', margin: 0, padding: 0 }}>
      <Sidebar />
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', flex: 1, padding: '20px' }}>
        <h2>Hello from Deals</h2>
      </div>
    </div>
  )
}

export default Deals
