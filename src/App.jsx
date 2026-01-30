import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SalesJournal from './pages/SalesJournal';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<SalesJournal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
