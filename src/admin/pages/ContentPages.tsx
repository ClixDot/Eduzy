'use client';
import React, { useEffect, useState } from 'react';
import { House, Info, GraduationCap, Images, Mail, MessagesSquare, PanelBottom, Sparkles, UserRound, Megaphone, BarChart3, BadgeCheck, CircleHelp, Quote, Newspaper, ArrowUpRight, Lock } from 'lucide-react';
import { SINGLETONS } from '@/cms/schema';
import type { Field } from '@/cms/fields';
import { api } from '../lib/api';
import { useAdmin } from '../lib/context';
import { SingletonEditor } from '../editors/SingletonEditor';
import { CollectionManager } from '../editors/CollectionManager';
import { ItemEditor } from '../editors/ItemEditor';
import { PageHeader, Tabs, useTab } from '../ui/PageHeader';
import { GuardedLink as Link } from '../shell/AdminShell';

/** Fields of a singleton that belong to one editor tab (tab hint removed so no inner tab bar shows). */
const fieldsOfTab = (key: string, ...tabs: string[]): Field[] => SINGLETONS[key].fields.filter((f) => tabs.includes(f.tab || '')).map((f) => ({ ...f, tab: undefined }));

function useCounts(collections: string[]) {
  const { version } = useAdmin();
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    Promise.all(collections.map((c) => api.get<{ items: any[] }>(`/api/admin/collections/${c}`).then((r) => [c, r.items.length] as const)))
      .then((pairs) => setCounts(Object.fromEntries(pairs)))
      .catch(() => undefined);
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
  return counts;
}

// ---------------------------------------------------------------------------
// Website CMS overview
// ---------------------------------------------------------------------------
export function WebsiteOverview() {
  const tiles = [
    { href: '/admin/pages/home', icon: House, title: 'Home Page', text: 'Section order, visibility and custom blocks.' },
    { href: '/admin/pages/home/hero', icon: Sparkles, title: 'Hero', text: 'Headline, description, buttons and founder image.' },
    { href: '/admin/pages/home/whyChoose', icon: BadgeCheck, title: 'Why Choose EDUZY', text: 'Introduction, feature cards and banner.' },
    { href: '/admin/pages/home/director', icon: UserRound, title: 'Founder message', text: 'Portrait, name, designation and message.' },
    { href: '/admin/pages/home/cta', icon: Megaphone, title: 'Call to action', text: 'Orange enrolment card on most pages.' },
    { href: '/admin/pages/home/featuredCourses', icon: GraduationCap, title: 'Featured courses', text: 'Optional course cards section.' },
    { href: '/admin/pages/about', icon: Info, title: 'About Page', text: 'Mission, vision, core values — and whether /about is live.' },
    { href: '/admin/pages/courses', icon: GraduationCap, title: 'Courses page & details', text: 'Courses page heading and labels on every course page.' },
    { href: '/admin/pages/portfolio', icon: Images, title: 'Portfolio / Blogs page', text: 'Hero, gallery, student achievements, campus & facilities.' },
    { href: '/admin/contact', icon: Mail, title: 'Contact Page', text: 'Page text, contact form and course enquiry form.' },
    { href: '/admin/pages/quick-contact', icon: MessagesSquare, title: 'Quick contact & floating buttons', text: '“Connect With Us” page and chat/call buttons.' },
    { href: '/admin/footer', icon: PanelBottom, title: 'Footer', text: 'Links, programmes, contact block, copyright.' },
    { href: '/admin/achievements', icon: BarChart3, title: 'Achievements & statistics', text: 'Counters, placement highlights, trust cards.' },
    { href: '/admin/testimonials', icon: Quote, title: 'Testimonials & videos', text: 'Student reviews and video stories.' },
    { href: '/admin/faq', icon: CircleHelp, title: 'FAQ', text: 'Questions and answers.' },
    { href: '/admin/blogs', icon: Newspaper, title: 'Blogs / Journal', text: 'Articles shown on the Blogs page.' },
  ];
  return (
    <>
      <PageHeader title="Website CMS" sub="Every page and section of eduzycampus.com. Pick what you want to change." />
      <div className="adm-tiles">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="adm-tile">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="adm-tile__icon"><t.icon size={20} /></span>
              <ArrowUpRight size={18} className="adm-muted" />
            </div>
            <span className="adm-tile__title">{t.title}</span>
            <span className="adm-tile__text">{t.text}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Simple single-editor pages
// ---------------------------------------------------------------------------
const HOME_SECTIONS: Record<string, { title: string; sub: string }> = {
  hero: { title: 'Hero', sub: 'The first screen of the home page.' },
  whyChoose: { title: 'Why Choose EDUZY', sub: 'Introduction, feature cards and the orange banner. Also used on the About page.' },
  director: { title: 'Director / Founder Message', sub: 'Shown on the home and About pages.' },
  cta: { title: 'Call to Action', sub: 'The orange card at the bottom of the home, courses, course detail, portfolio and About pages.' },
  featuredCourses: { title: 'Featured Courses', sub: 'Optional section — turn it on under Home Page → section order.' },
};

export function HomeSectionEditor({ section }: { section: string }) {
  const meta = HOME_SECTIONS[section];
  if (!meta) return <div className="adm-notice adm-notice--error">This section does not exist.</div>;
  return (
    <>
      <PageHeader title={meta.title} sub={meta.sub} />
      <SingletonEditor docKey={section} folder="pages" />
    </>
  );
}

export function SimpleSingletonPage({ docKey, title, sub, folder, before }: { docKey: string; title: string; sub: string; folder?: string; before?: React.ReactNode }) {
  const { me } = useAdmin();
  const perm = SINGLETONS[docKey].permission;
  if (perm && me && !me.permissions[perm]) return <NoAccess title={title} />;
  return (
    <>
      <PageHeader title={title} sub={sub} />
      <SingletonEditor docKey={docKey} folder={folder} before={before} />
    </>
  );
}

function NoAccess({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="adm-notice adm-notice--warning"><Lock size={16} /> Only website owners can change this. Ask an owner if something needs updating.</div>
    </>
  );
}

const SharedNote = ({ links }: { links: { href: string; label: string }[] }) => (
  <div className="adm-notice adm-notice--info" style={{ flexWrap: 'wrap' }}>
    <Info size={16} />
    <span>Shared sections are edited once and appear everywhere they are used: {links.map((l, i) => <React.Fragment key={l.href}>{i > 0 && ', '}<Link href={l.href} className="adm-link" style={{ textDecoration: 'underline' }}>{l.label}</Link></React.Fragment>)}.</span>
  </div>
);

export function AboutEditor() {
  return (
    <SimpleSingletonPage
      docKey="about"
      title="About Page"
      sub="Page heading, mission, vision and core values. Turn the page on to publish it at /about (it currently redirects to Portfolio)."
      before={<SharedNote links={[{ href: '/admin/pages/home/whyChoose', label: 'Why Choose EDUZY' }, { href: '/admin/achievements?tab=stats', label: 'Statistics' }, { href: '/admin/accreditation', label: 'Accreditation' }, { href: '/admin/pages/home/director', label: 'Founder message' }, { href: '/admin/achievements?tab=trust', label: 'Trust cards' }, { href: '/admin/pages/home/cta', label: 'Call to action' }]} />}
    />
  );
}

export function PortfolioEditor() {
  const [tab, setTab] = useTab(['page', 'achievements', 'campus'] as const, 'page');
  const pageFields = SINGLETONS.portfolio.fields.filter((f) => f.tab !== 'Campus & facilities');
  return (
    <>
      <PageHeader title="Portfolio / Blogs page" sub="The page at /portfolio and /blogs. Every heading, card and section on the page can be edited here." />
      <Tabs
        tabs={[{ id: 'page', label: 'Hero, gallery & sections' }, { id: 'achievements', label: 'Student achievements' }, { id: 'campus', label: 'Campus & facilities' }]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'page' && (
        <SingletonEditor
          docKey="portfolio"
          fields={pageFields}
          before={<SharedNote links={[{ href: '/admin/gallery', label: 'Gallery photos' }, { href: '/admin/testimonials?tab=videos', label: 'Video stories' }, { href: '/admin/blogs', label: 'Blog posts' }, { href: '/admin/pages/home/cta', label: 'Call to action' }]} />}
        />
      )}
      {tab === 'achievements' && (
        <SingletonEditor docKey="placementAchievements" title="Student achievements section" previewNote="Section heading, description and the achievement cards. Turn the section on or off under “Hero, gallery & sections” → Sections." />
      )}
      {tab === 'campus' && (
        <SingletonEditor docKey="portfolio" title="Campus & facilities section" fields={fieldsOfTab('portfolio', 'Campus & facilities')} anchor="campus-section" />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Contact page: page text + forms, and the global contact details
// ---------------------------------------------------------------------------
export function ContactEditor() {
  const { me } = useAdmin();
  const [tab, setTab] = useTab(['page', 'details'] as const, 'page');
  return (
    <>
      <PageHeader title="Contact Page" sub="Contact page text and forms. Phone, WhatsApp, email, address, map and social links are shared with the whole website." />
      <Tabs tabs={[{ id: 'page', label: 'Page text & forms' }, { id: 'details', label: 'Contact details & social links' }]} value={tab} onChange={setTab} />
      {tab === 'page' && <SingletonEditor docKey="contact" />}
      {tab === 'details' && (me?.permissions.settings ? (
        <SingletonEditor docKey="settings" title="Contact details (website-wide)" fields={fieldsOfTab('settings', 'Contact & social')} previewPath="/contact" anchor="contact-info" before={<div className="adm-notice adm-notice--orange"><Info size={16} />These details update the header, footer, contact page, floating buttons and WhatsApp links everywhere.</div>} />
      ) : (
        <div className="adm-notice adm-notice--warning"><Lock size={16} /> Only website owners can change the contact details.</div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Collections with section text
// ---------------------------------------------------------------------------
export function CoursesList() {
  const counts = useCounts(['courses']);
  return (
    <>
      <PageHeader title="Courses" sub={`All diploma programmes${counts.courses !== undefined ? ` (${counts.courses})` : ''}. Each course has its own page at /courses/<address>.`} actions={<Link href="/admin/pages/courses" className="adm-btn adm-btn--light">Courses page text</Link>} />
      <CollectionManager collection="courses" addLabel="New course" />
    </>
  );
}

export function CourseEditorPage({ id }: { id: string }) {
  return <ItemEditor collection="courses" id={id} mode="page" />;
}

export function CourseCategoriesPage() {
  return (
    <>
      <PageHeader title="Course Categories" sub="The filter tabs on the Courses page. A category can only be deleted when no course uses it." />
      <CollectionManager collection="courseCategories" addLabel="New category" />
    </>
  );
}

export function BlogsPage() {
  const [tab, setTab] = useTab(['posts', 'categories', 'page', 'achievements', 'campus'] as const, 'posts');
  const counts = useCounts(['blogs', 'blogCategories']);
  return (
    <>
      <PageHeader
        title="Blogs / Journal"
        sub="Articles appear on the Blogs page (/blogs) once published, each with its own page."
        actions={<Link href="/admin/pages/portfolio" className="adm-btn adm-btn--light">Full page settings</Link>}
      />
      <Tabs
        tabs={[{ id: 'posts', label: 'Posts' }, { id: 'categories', label: 'Categories' }, { id: 'page', label: 'Listing text' }, { id: 'achievements', label: 'Student achievements' }, { id: 'campus', label: 'Campus & facilities' }]}
        value={tab}
        onChange={setTab}
        counts={{ posts: counts.blogs, categories: counts.blogCategories }}
      />
      {tab === 'posts' && <CollectionManager collection="blogs" addLabel="Write a post" />}
      {tab === 'categories' && <CollectionManager collection="blogCategories" addLabel="New category" compact />}
      {tab === 'page' && <SingletonEditor docKey="journal" previewNote="The blog list only appears on the website when at least one post is published." />}
      {tab === 'achievements' && <SingletonEditor docKey="placementAchievements" title="Student achievements section" />}
      {tab === 'campus' && <SingletonEditor docKey="portfolio" title="Campus & facilities section" fields={fieldsOfTab('portfolio', 'Campus & facilities')} anchor="campus-section" />}
    </>
  );
}

export function BlogEditorPage({ id }: { id: string }) {
  return <ItemEditor collection="blogs" id={id} mode="page" />;
}

export function GalleryPage() {
  const [tab, setTab] = useTab(['photos', 'categories', 'text'] as const, 'photos');
  const counts = useCounts(['gallery', 'galleryCategories']);
  return (
    <>
      <PageHeader title="Gallery" sub="The Academy Photo Gallery on the Portfolio / Blogs page." />
      <Tabs tabs={[{ id: 'photos', label: 'Photos' }, { id: 'categories', label: 'Categories' }, { id: 'text', label: 'Section text' }]} value={tab} onChange={setTab} counts={{ photos: counts.gallery, categories: counts.galleryCategories }} />
      {tab === 'photos' && <CollectionManager collection="gallery" addLabel="Add photo" />}
      {tab === 'categories' && <CollectionManager collection="galleryCategories" addLabel="New category" compact />}
      {tab === 'text' && <SingletonEditor docKey="portfolio" title="Gallery section text" fields={fieldsOfTab('portfolio', 'Gallery')} anchor="gallery-section" />}
    </>
  );
}

export function TestimonialsPage() {
  const [tab, setTab] = useTab(['written', 'videos', 'text', 'videotext'] as const, 'written');
  const counts = useCounts(['testimonials', 'videoTestimonials']);
  return (
    <>
      <PageHeader title="Testimonials" sub="Student reviews (home page cards and course pages) and the video stories carousel." />
      <Tabs tabs={[{ id: 'written', label: 'Written reviews' }, { id: 'videos', label: 'Video stories' }, { id: 'text', label: 'Reviews heading' }, { id: 'videotext', label: 'Videos heading' }]} value={tab} onChange={setTab} counts={{ written: counts.testimonials, videos: counts.videoTestimonials }} />
      {tab === 'written' && <CollectionManager collection="testimonials" addLabel="Add testimonial" />}
      {tab === 'videos' && <CollectionManager collection="videoTestimonials" addLabel="Add video story" />}
      {tab === 'text' && <SingletonEditor docKey="testimonialsSection" />}
      {tab === 'videotext' && <SingletonEditor docKey="videoSection" />}
    </>
  );
}

export function AchievementsPage() {
  const [tab, setTab] = useTab(['stats', 'placements', 'trust'] as const, 'stats');
  return (
    <>
      <PageHeader title="Achievements" sub="Statistics counters (home & About), student achievements (Portfolio) and trust & outcomes cards (About)." />
      <Tabs tabs={[{ id: 'stats', label: 'Statistics counters' }, { id: 'placements', label: 'Student achievements' }, { id: 'trust', label: 'Trust & outcomes cards' }]} value={tab} onChange={setTab} />
      {tab === 'stats' && <SingletonEditor docKey="stats" />}
      {tab === 'placements' && <SingletonEditor docKey="placementAchievements" />}
      {tab === 'trust' && <SingletonEditor docKey="achievements" previewNote="These cards appear on the About page (and on the home page if you add the section there)." />}
    </>
  );
}

export function AccreditationPage() {
  const [tab, setTab] = useTab(['logos', 'text'] as const, 'logos');
  const counts = useCounts(['accreditations']);
  return (
    <>
      <PageHeader title="Accreditation" sub="International certificates (large top row) and partner logos. Disabled logos stay in the list but are hidden on the website." />
      <Tabs tabs={[{ id: 'logos', label: 'Logos' }, { id: 'text', label: 'Section text' }]} value={tab} onChange={setTab} counts={{ logos: counts.accreditations }} />
      {tab === 'logos' && <CollectionManager collection="accreditations" addLabel="Add logo" newDefaults={{ group: 'partner' }} cardsPerRow={6} />}
      {tab === 'text' && <SingletonEditor docKey="accreditationSection" />}
    </>
  );
}

export function FaqPage() {
  const [tab, setTab] = useTab(['questions', 'text'] as const, 'questions');
  const counts = useCounts(['faqs']);
  return (
    <>
      <PageHeader title="FAQ" sub="Frequently asked questions on the home page." />
      <Tabs tabs={[{ id: 'questions', label: 'Questions' }, { id: 'text', label: 'Section text' }]} value={tab} onChange={setTab} counts={{ questions: counts.faqs }} />
      {tab === 'questions' && <CollectionManager collection="faqs" addLabel="Add question" />}
      {tab === 'text' && <SingletonEditor docKey="faqSection" />}
    </>
  );
}
