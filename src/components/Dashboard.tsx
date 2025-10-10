import React from 'react';
import './Dashboard.css';

const cardData = [
  {
    icon: '📊',
    title: 'Timeline',
    description: "Visual timeline of your puppy's journey and milestones.",
    link: '/timeline',
  },
  {
    icon: '🎯',
    title: 'Training Programs',
    description: 'Expert-designed training programs for your puppy.',
    link: '/training',
  },
  {
    icon: '🐱',
    title: 'Cat Integration Tips',
    description: 'Safety and tips for introducing your puppy to your cat.',
    link: '/cat-integration',
  },
  {
    icon: '📝',
    title: 'Daily Activity Logging',
    description: 'Log daily activities, meals, potty, and health records.',
    link: '/activity',
  },
];

const Dashboard: React.FC = () => (
  <div className="container">
    <div className="header">
      <h1>🐕 Puppy Tracker - Bernedoodle Journey</h1>
      <p>Expert training programs for your bernedoodle puppy and cat integration</p>
    </div>
    <div className="features-grid">
      {cardData.map(card => (
        <a href={card.link} className="feature-card" key={card.title} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="feature-icon">{card.icon}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </a>
      ))}
    </div>
  </div>
);

export default Dashboard;
