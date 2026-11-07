'use client';
import React from 'react';
import { useSite } from '@/cms/site/ContentProvider';
import { CmsIcon } from '@/cms/site/helpers';
import './Achievements.css';

export default function Achievements() {
  const { achievements } = useSite();
  const proofs = achievements.items || [];

  return (
    <section className="achievements section" id="achievements" aria-label="Academy Trust and Outcomes">
      <div className="container">
        <div className="text-center achievements__header">
          <h2 className="section-title">{achievements.title}</h2>
          <p className="section-subtitle">
            {achievements.subtitle}
          </p>
        </div>

        <div className="achievements__grid">
          {proofs.map((item: any, i: number) => (
            <div className="proof-card" key={i}>
              <div className="proof-card__top">
                <div className="proof-card__icon" aria-hidden="true">
                  <CmsIcon name={item.icon} strokeWidth={2} />
                </div>
                <span className="proof-card__tag">{item.tag}</span>
              </div>
              <h3 className="proof-card__title">{item.title}</h3>
              <p className="proof-card__desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
