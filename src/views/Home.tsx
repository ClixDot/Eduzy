'use client';
import React from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import About from '../components/About';
import Accreditation from '../components/Accreditation';
import DirectorMessage from '../components/DirectorMessage';
import VideoTestimonials from '../components/VideoTestimonials';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Achievements from '../components/Achievements';
import FeaturedCourses from '../components/FeaturedCourses';
import CustomBlock from '../components/CustomBlock';
import { useSite } from '@/cms/site/ContentProvider';

/** Home page sections, in the order and visibility set in Admin → Home Page. */
const SECTIONS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  stats: TrustStats,
  whyChoose: About,
  accreditation: Accreditation,
  featuredCourses: FeaturedCourses,
  director: DirectorMessage,
  videoStories: VideoTestimonials,
  testimonials: Testimonials,
  achievements: Achievements,
  faq: FAQ,
  cta: CTA,
};

export default function Home() {
  const { home } = useSite();

  return (
    <main id="main-content">
      {(home.sections || [])
        .filter((s: any) => s.enabled)
        .map((s: any) => {
          if (s.type === 'richText') return <CustomBlock key={s.id} id={s.id} block={home.blocks?.[s.id] || {}} />;
          const Section = SECTIONS[s.type];
          return Section ? <Section key={s.id} /> : null;
        })}
    </main>
  );
}
