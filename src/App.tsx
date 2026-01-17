import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { TripPlanner } from './pages/TripPlanner';

function App() {
  return (
    <GoogleMapsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
           <Navbar />
           <div className="flex-1">
             <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/plan" element={<TripPlanner />} />
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </div>
        </div>
      </Router>
    </GoogleMapsProvider>
  );
}

export default App;
