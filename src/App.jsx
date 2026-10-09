import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingContact from './components/FloatingContact';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Portfolio from './pages/Portfolio';
import QuickContact from './pages/QuickContact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="site-wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseSlug" element={<CourseDetails />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Navigate to="/" replace />} />
          <Route path="/quick-contact" element={<QuickContact />} />
          <Route path="/connect" element={<QuickContact />} />
          <Route path="/about" element={<Navigate to="/portfolio" replace />} />
          <Route path="/why-choose-us" element={<Navigate to="/portfolio" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <FloatingContact />
      </div>
    </Router>
  );
}
