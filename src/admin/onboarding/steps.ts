/**
 * Guided-tour steps. Every step points at a real element on a real admin page:
 * `route` is opened first, then `target` (a CSS selector) is highlighted.
 */
export interface TourStep {
  id: string;
  route: string;
  target: string;
  title: string;
  text: string;
  points: string[];
  /** the sidebar is off-canvas on small screens, so open it for this step */
  needsSidebar?: boolean;
  /** hide the step from admins without this permission */
  permission?: 'settings' | 'users';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    route: '/admin',
    target: '.adm-hero',
    title: 'Your dashboard',
    text: 'A quick summary of the website every time you sign in.',
    points: [
      'Statistics: pages, published items and unpublished drafts.',
      'Below: content activity, drafts waiting to publish, and recent edits.',
      'Admin activity shows who changed what. Quick actions jump straight to common tasks.',
    ],
  },
  {
    id: 'sidebar',
    route: '/admin',
    target: '.adm-sidebar__nav',
    needsSidebar: true,
    title: 'Sidebar navigation',
    text: 'Everything you can edit is one click away.',
    points: [
      'Pages: Home, About, Portfolio / Blogs, Contact and Footer.',
      'Content: Courses, Blogs, Gallery, Testimonials, Achievements, FAQ.',
      'Library & settings: Media Library, Global Settings and SEO.',
    ],
  },
  {
    id: 'website',
    route: '/admin/website',
    target: '.adm-tiles',
    title: 'Website CMS',
    text: 'Every public page and shared section of the website, in one place.',
    points: ['Pick a tile to open that page or section.', 'Shared sections (like the call-to-action) are edited once and update everywhere.'],
  },
  {
    id: 'home',
    route: '/admin/pages/home',
    target: '.adm-sections',
    title: 'Home page editor',
    text: 'Control what appears on the home page and in which order.',
    points: [
      'Drag sections to reorder them, or switch them off.',
      'Click the pencil on a section to edit its headings, text, images, buttons and links.',
      'Use “Add section” to add a section, or remove one you don’t need.',
    ],
  },
  {
    id: 'courses',
    route: '/admin/courses',
    target: '.adm-toolbar',
    title: 'Courses',
    text: 'Add and manage every diploma programme.',
    points: [
      '“New course” adds a programme. Click any course to edit it.',
      'Inside a course: Basics, Details, Images and SEO tabs.',
      'Publish or unpublish a course to show or hide it on the website.',
    ],
  },
  {
    id: 'blogs',
    route: '/admin/blogs',
    target: '.adm-toolbar',
    title: 'Blogs / Journal',
    text: 'Write articles that appear on the Blogs page, each with its own page.',
    points: ['“Write a post” starts a new article.', 'Save it as a draft while you work, then publish when it’s ready.'],
  },
  {
    id: 'media',
    route: '/admin/media',
    target: '.adm-page-head__actions',
    title: 'Media Library',
    text: 'All website images, in one place.',
    points: [
      'Upload images here, or straight from any image field.',
      'Click an image to preview it, add a description, replace it everywhere it’s used, or delete it.',
    ],
  },
  {
    id: 'settings',
    route: '/admin/settings',
    target: '.adm-editor__form .adm-seg',
    permission: 'settings',
    title: 'Global Settings',
    text: 'Website-wide details, grouped into tabs.',
    points: [
      'Brand: website name, logo and favicon.',
      'Announcement & popup: a message bar or popup for visitors.',
      'Contact & social: phone, WhatsApp, email, address and social links.',
    ],
  },
  {
    id: 'publish',
    route: '/admin/pages/home/hero',
    target: '.adm-editor__bar',
    title: 'Save, preview & publish',
    text: 'Every editor has this bar. Changes only go live when you publish.',
    points: [
      'Save draft: keeps your changes private (Ctrl+S).',
      'Preview: see the page with your changes before anyone else does.',
      'Publish: puts the changes on the public website. Open “View website” to check them.',
    ],
  },
];
