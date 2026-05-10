import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { TripPlanner } from './pages/TripPlanner';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ReserveVehiclePage } from './pages/ReserveVehiclePage';
import { GalleryPage } from './pages/GalleryPage';
import { Footer } from './components/Footer';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <GoogleMapsProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
           <Navbar />
           <div className="flex-1">
             <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/reserve" element={<ReserveVehiclePage />} />
               <Route path="/gallery" element={<GalleryPage />} />
               <Route path="/contact" element={<ContactPage />} />
               <Route path="/plan" element={<TripPlanner />} />
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </div>
           <Footer />
        </div>
      </Router>
    </GoogleMapsProvider>
  );
}

export default App;
