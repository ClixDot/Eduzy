import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="section text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '16px 0' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-secondary)', marginBottom: '30px' }}>
          Sorry, the page you are looking for does not exist or has been moved. Explore our popular courses or head back to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/courses" className="btn btn-outline">Explore Courses</Link>
        </div>
      </div>
    </main>
  );
}
