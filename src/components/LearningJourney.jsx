import React, { useEffect, useRef } from 'react';
import { BookOpen, Users, MessageSquareCheck, Clock, Trophy } from 'lucide-react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import './LearningJourney.css';

const steps = [
  {
    step: '01',
    title: 'Choose Your Course',
    desc: 'Select from our wide range of language tests or healthcare licensure programs aligned with your goals.',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Learn With Experts',
    desc: 'Interactive lectures and strategy sessions led by certified subject specialists in focused batches.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Practice & Feedback',
    desc: 'Engage in daily role-plays, question drills, and receive 1-on-1 personalized corrective feedback.',
    icon: MessageSquareCheck,
  },
  {
    step: '04',
    title: 'Simulated Mocks',
    desc: 'Take timed computer & paper mock exams under authentic testing conditions to eliminate exam stress.',
    icon: Clock,
  },
  {
    step: '05',
    title: 'Achieve Dream Score',
    desc: 'Pass on your first attempt and launch your global career in the UK, USA, Australia, Canada, or Gulf.',
    icon: Trophy,
    isGoal: true,
  },
];

export default function LearningJourney() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal
      gsap.from('.journey__header > *', {
        y: 20,
        stagger: 0.06,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Step cards sequential stagger
      gsap.from('.journey-step', {
        y: 25,
        scale: 0.97,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="journey section" id="learning-journey" ref={sectionRef} aria-label="Learning Journey">
      {/* Decorative ambient background glows */}
      <div className="journey__bg-glow journey__bg-glow--left" aria-hidden="true" />
      <div className="journey__bg-glow journey__bg-glow--right" aria-hidden="true" />

      <div className="container journey__container">
        {/* Section Header */}
        <div className="text-center journey__header">
          <h2 className="section-title">
            Your Learning Journey <span className="highlight-orange">Starts Here</span>
          </h2>
          <p className="section-subtitle">
            A proven 5-step roadmap developed by expert mentors to take you from preparation to first-attempt success.
          </p>
        </div>

        {/* Connected Process Flow */}
        {/* 5 Step Cards */}
        <div className="journey__cards">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div 
                className={`journey-step ${step.isGoal ? 'journey-step--goal' : ''}`} 
                key={step.step}
              >
                {/* Card Content */}
                <div className="journey-card">
                  {/* Watermark Step Number */}
                  <span className="journey-card__watermark" aria-hidden="true">
                    {step.step}
                  </span>

                  {/* Card Top: Icon */}
                  <div className="journey-card__header">
                    <div className="journey-card__icon-box" aria-hidden="true">
                      <Icon size={22} className="journey-card__icon-svg" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="journey-card__body">
                    <h3 className="journey-card__title">{step.title}</h3>
                    <p className="journey-card__desc">{step.desc}</p>
                  </div>

                  {/* Goal Celebratory Indicator */}
                  {step.isGoal && (
                    <div className="journey-card__goal-tag">
                      <Trophy size={13} />
                      <span>Global Career Destination</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
