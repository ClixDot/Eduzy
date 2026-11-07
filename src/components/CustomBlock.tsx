'use client';
import React from 'react';
import { isExternal } from '@/cms/site/helpers';
import '../components/site/SiteExtras.css';

/** A free-form block added from Admin → Home Page → Add section → Custom text block. */
export default function CustomBlock({ id, block }: { id: string; block: any }) {
  if (!block?.heading) return null;
  const hasImage = !!block.image;
  return (
    <section className={`section ${block.background === 'light' ? 'bg-light-orange' : ''}`} id={id} aria-label={block.heading}>
      <div className="container">
        <div className={`cms-block__grid ${hasImage ? 'cms-block__grid--image' : ''} ${block.imageSide === 'left' ? 'cms-block__grid--left' : ''}`}>
          <div>
            {block.tag && <span className="section-tag">{block.tag}</span>}
            <h2 className="section-title">{block.heading}</h2>
            {block.body && <div className="cms-block__body" dangerouslySetInnerHTML={{ __html: block.body }} />}
            {block.buttonLabel && block.buttonUrl && (
              <a href={block.buttonUrl} className="btn btn-primary cms-block__btn" {...(isExternal(block.buttonUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {block.buttonLabel}
              </a>
            )}
          </div>
          {hasImage && (
            <div className="cms-block__media">
              <img src={block.image} alt={block.heading} loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
