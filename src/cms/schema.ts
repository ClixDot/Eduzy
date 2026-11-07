/**
 * EDUZY CMS content model.
 * Singletons = one document (a page or a website section).
 * Collections = lists of items (courses, blog posts, gallery photos, ...).
 */
import { Field, f, buttonFields, seoFields } from './fields';

export type Permission = 'content' | 'settings' | 'users';

export interface SingletonDef {
  key: string;
  label: string;
  description: string;
  /** public page used for live preview */
  previewPath: string;
  /** element id to scroll to in the preview */
  anchor?: string;
  fields: Field[];
  permission?: Permission;
}

export interface CollectionDef {
  name: string;
  label: string;
  singular: string;
  description: string;
  fields: Field[];
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  slugField?: string;
  slugFrom?: string;
  /** fields searched by the list search box */
  searchFields: string[];
  /** filter dropdown on the list page */
  filterField?: string;
  filterOptionsFrom?: 'courseCategories' | 'galleryCategories' | 'blogCategories';
  /** public page used for live preview of one item */
  previewPath: (item: Record<string, any>) => string;
  anchor?: string;
  /** collections with an editor page (vs. an inline drawer) */
  fullPageEditor?: boolean;
  /** item-level wording for publish status */
  publishWord?: { on: string; off: string };
}

const sectionTitle = (o: { start?: string } = {}): Field[] => [
  f.text('titleStart', o.start || 'Heading', { max: 160, half: true }),
  f.text('titleHighlight', 'Highlighted words (orange)', { max: 160, half: true }),
];

// ---------------------------------------------------------------------------
// SINGLETONS
// ---------------------------------------------------------------------------

export const SINGLETONS: Record<string, SingletonDef> = {
  settings: {
    key: 'settings',
    label: 'Global Settings',
    description: 'Website name, logo, contact details, social links, announcement bar, popup and maintenance mode.',
    previewPath: '/',
    permission: 'settings',
    fields: [
      f.text('siteName', 'Website name', { required: true, max: 80, half: true, tab: 'Brand' }),
      f.text('legalName', 'Organisation name (copyright & search engines)', { required: true, max: 120, half: true, tab: 'Brand' }),
      f.text('tagline', 'Tagline', { max: 120, half: true, tab: 'Brand' }),
      f.url('siteUrl', 'Website address', { required: true, half: true, tab: 'Brand', help: 'Used for canonical links and the sitemap, e.g. https://eduzycampus.com' }),
      f.image('logo', 'Website logo', { required: true, tab: 'Brand', help: 'Used in the header and footer unless they set their own.' }),
      f.text('logoAlt', 'Logo description (alt text)', { max: 160, tab: 'Brand' }),
      f.image('favicon', 'Favicon (browser tab icon)', { tab: 'Brand', help: 'Square image, at least 64 × 64 px.' }),
      f.area('organizationDescription', 'Organisation description (search engines)', { tab: 'Brand', max: 500, help: 'Used in the structured data Google reads about EDUZY.' }),
      f.group('contact', 'Contact details (used everywhere on the website)', [
        { name: 'phone', label: 'Phone number for calls', type: 'tel', required: true, half: true, help: 'International format, e.g. +916235210100' },
        { name: 'phoneDisplay', label: 'Phone number as displayed', type: 'text', required: true, half: true, max: 40 },
        { name: 'whatsapp', label: 'WhatsApp number', type: 'tel', required: true, half: true, help: 'Digits with country code, no + or spaces, e.g. 916235210100' },
        { name: 'email', label: 'Email address', type: 'email', required: true, half: true },
        { name: 'address', label: 'Address / locations', type: 'textarea', rows: 2, max: 500 },
        { name: 'hours', label: 'Opening hours', type: 'text', max: 120, half: true },
        { name: 'mapUrl', label: 'Google Maps embed link', type: 'url', half: true, help: 'Optional. In Google Maps: Share → Embed a map → copy the link inside src="…". Shown on the Contact page.' },
        { name: 'region', label: 'State / region', type: 'text', max: 80, half: true },
        { name: 'country', label: 'Country code', type: 'text', max: 2, half: true, help: 'Two letters, e.g. IN' },
        { name: 'areaServed', label: 'Cities served (search engines)', type: 'stringList', itemLabel: 'City', max: 80 },
      ], { tab: 'Contact & social' }),
      f.group('social', 'Social media links', [
        { name: 'facebook', label: 'Facebook', type: 'url', half: true },
        { name: 'instagram', label: 'Instagram', type: 'url', half: true },
        { name: 'youtube', label: 'YouTube', type: 'url', half: true },
        { name: 'youtubeComingSoon', label: 'Show YouTube as “Coming soon”', type: 'toggle', half: true },
        { name: 'linkedin', label: 'LinkedIn', type: 'url', half: true },
        { name: 'twitter', label: 'X / Twitter', type: 'url', half: true },
      ], { tab: 'Contact & social' }),
      f.group('announcement', 'Announcement bar', [
        f.toggle('enabled', 'Show announcement bar at the top of every page'),
        f.text('text', 'Announcement text', { max: 200 }),
        f.text('linkLabel', 'Link text', { max: 40, half: true }),
        f.url('linkUrl', 'Link', { half: true }),
        f.toggle('dismissible', 'Visitors can close it'),
      ], { tab: 'Announcement & popup' }),
      f.group('popup', 'Popup', [
        f.toggle('enabled', 'Show a popup to visitors'),
        f.text('title', 'Popup heading', { max: 120 }),
        f.area('message', 'Popup message', { max: 600 }),
        f.image('image', 'Popup image'),
        f.text('buttonLabel', 'Button text', { max: 40, half: true }),
        f.url('buttonUrl', 'Button link', { half: true }),
        f.num('delaySeconds', 'Show after (seconds)', { min: 0, max: 120, half: true }),
        f.select('frequency', 'How often', [
          { value: 'session', label: 'Once per visit' },
          { value: 'always', label: 'Every page load' },
        ], { half: true }),
      ], { tab: 'Announcement & popup' }),
      f.group('maintenance', 'Maintenance mode', [
        f.toggle('enabled', 'Turn on maintenance mode', { help: 'Visitors see the message below instead of the website. Signed-in admins can still preview pages.' }),
        f.text('title', 'Heading', { max: 120 }),
        f.area('message', 'Message', { max: 600 }),
      ], { tab: 'Maintenance' }),
    ],
  },

  seo: {
    key: 'seo',
    label: 'SEO Settings',
    description: 'Default search engine settings and per-page titles, descriptions and social share images.',
    previewPath: '/',
    permission: 'settings',
    fields: [
      f.group('defaults', 'Website defaults', [
        f.text('title', 'Default SEO title', { required: true, max: 120 }),
        f.area('description', 'Default meta description', { required: true, max: 320 }),
        f.text('keywords', 'Default keywords', { max: 600 }),
        f.image('ogImage', 'Default social share image'),
        f.text('themeColor', 'Browser theme colour', { max: 20, help: 'Colour of the mobile browser bar, e.g. #FF3B0B' }),
      ], { tab: 'Defaults' }),
      f.group('home', 'Home page', seoFields, { tab: 'Home' }),
      f.group('courses', 'Courses page', seoFields, { tab: 'Courses' }),
      f.group('blogs', 'Blogs page', seoFields, { tab: 'Blogs' }),
      f.group('portfolio', 'Portfolio page', seoFields, { tab: 'Portfolio' }),
      f.group('contact', 'Contact page', seoFields, { tab: 'Contact' }),
      f.group('quickContact', 'Quick contact page', seoFields, { tab: 'Quick contact' }),
      f.group('about', 'About page', seoFields, { tab: 'About' }),
    ],
  },

  header: {
    key: 'header',
    label: 'Header & Navigation',
    description: 'Logo, menu links, the Enroll button and the mobile menu.',
    previewPath: '/',
    fields: [
      f.toggle('visible', 'Show the header'),
      f.image('logo', 'Header logo', { help: 'Leave empty to use the website logo from Global Settings.' }),
      f.text('logoAlt', 'Logo description (alt text)', { max: 160 }),
      f.repeater('navItems', 'Menu links', [
        f.text('label', 'Link text', { required: true, max: 40, half: true }),
        f.url('url', 'Link', { required: true, half: true }),
        f.toggle('visible', 'Show this link'),
      ], { itemLabel: 'Menu link', titleField: 'label', maxItems: 10 }),
      f.toggle('showCta', 'Show the highlighted button'),
      f.text('ctaLabel', 'Button text', { max: 40, half: true }),
      f.url('ctaUrl', 'Button link', { half: true }),
      f.toggle('showMobileCall', 'Show “Call us” button in the mobile menu'),
      f.text('mobileCallLabel', 'Mobile call button text', { max: 40 }),
    ],
  },

  footer: {
    key: 'footer',
    label: 'Footer',
    description: 'Footer logo, description, links, programmes list, contact block and copyright.',
    previewPath: '/',
    anchor: 'site-footer',
    fields: [
      f.toggle('visible', 'Show the footer', { tab: 'Content' }),
      f.image('logo', 'Footer logo', { tab: 'Content', help: 'Leave empty to use the website logo.' }),
      f.area('description', 'Description', { max: 400, tab: 'Content' }),
      f.toggle('showSocials', 'Show social media buttons', { tab: 'Content' }),
      f.text('programsHeading', 'Programmes column heading', { max: 60, tab: 'Programmes' }),
      f.select('programsSource', 'Programmes to list', [
        { value: 'courses', label: 'All published courses (automatic)' },
        { value: 'custom', label: 'A custom list' },
      ], { tab: 'Programmes' }),
      f.repeater('customPrograms', 'Custom programme links', [
        f.text('label', 'Text', { required: true, max: 160, half: true }),
        f.url('url', 'Link', { required: true, half: true }),
      ], { itemLabel: 'Programme', titleField: 'label', tab: 'Programmes' }),
      f.num('programsInitialCount', 'Programmes shown before “View More”', { min: 1, max: 30, tab: 'Programmes' }),
      f.text('contactHeading', 'Contact column heading', { max: 60, tab: 'Contact', help: 'Phone, email, address and hours come from Global Settings → Contact & social.' }),
      f.group('cta', 'Footer call-to-action strip', [
        f.toggle('enabled', 'Show a call-to-action strip above the footer links'),
        f.text('heading', 'Heading', { max: 140 }),
        f.text('buttonLabel', 'Button text', { max: 40, half: true }),
        f.url('buttonUrl', 'Button link', { half: true }),
      ], { tab: 'Call to action' }),
      f.text('copyrightName', 'Copyright name', { max: 120, half: true, tab: 'Bottom bar' }),
      f.text('copyrightSuffix', 'Copyright text after the name', { max: 120, half: true, tab: 'Bottom bar' }),
      f.toggle('showPoweredBy', 'Show “Powered by”', { tab: 'Bottom bar' }),
      f.text('poweredByLabel', '“Powered by” name', { max: 60, half: true, tab: 'Bottom bar' }),
      f.url('poweredByUrl', '“Powered by” link', { half: true, tab: 'Bottom bar' }),
      f.repeater('legalLinks', 'Legal links', [
        f.text('label', 'Text', { required: true, max: 60, half: true }),
        f.url('url', 'Link', { required: true, half: true }),
      ], { itemLabel: 'Legal link', titleField: 'label', maxItems: 6, tab: 'Bottom bar' }),
      f.text('backToTopLabel', '“Back to top” text', { max: 40, tab: 'Bottom bar' }),
    ],
  },

  // ---------------- Home page ----------------
  home: {
    key: 'home',
    label: 'Home Page – section order',
    description: 'Order, visibility and custom blocks of the home page.',
    previewPath: '/',
    fields: [], // edited with the dedicated section manager
  },

  hero: {
    key: 'hero',
    label: 'Hero',
    description: 'The first thing visitors see: headline, description, buttons and the founder image.',
    previewPath: '/',
    anchor: 'top',
    fields: [
      f.text('line1Start', 'Headline line 1', { max: 80, half: true, tab: 'Text' }),
      f.text('line1Highlight', 'Line 1 – orange words', { max: 80, half: true, tab: 'Text' }),
      f.text('line2Start', 'Headline line 2', { max: 80, half: true, tab: 'Text' }),
      f.text('line2Highlight', 'Line 2 – orange words', { max: 80, half: true, tab: 'Text' }),
      f.inline('description', 'Description', { tab: 'Text', help: 'Use bold to highlight programme names.' }),
      f.group('primaryButton', 'Outline button', buttonFields(), { tab: 'Buttons' }),
      f.group('secondaryButton', 'Orange button', buttonFields('Leave empty to open the Contact page enquiry (default).'), { tab: 'Buttons' }),
      f.image('portraitImage', 'Foreground image (founder portrait)', { required: true, tab: 'Images' }),
      f.text('portraitAlt', 'Foreground image description (alt text)', { max: 200, tab: 'Images' }),
      f.select('portraitFit', 'Foreground image fit', [
        { value: 'original', label: 'Original EDUZY framing (tuned for the current portrait)' },
        { value: 'cover', label: 'Fill the frame (use for a new photo)' },
      ], { half: true, tab: 'Images' }),
      f.text('portraitPosition', 'Focus point when filling the frame', { max: 40, half: true, tab: 'Images', help: 'e.g. “center top” keeps the face visible.' }),
      f.image('mobileImage', 'Mobile foreground image', { tab: 'Images', help: 'Optional. Used on phones instead of the foreground image.' }),
      f.image('backgroundImage', 'Background photo', { tab: 'Images', help: 'Leave empty to keep the default study background.' }),
      f.text('backgroundPosition', 'Background position', { max: 40, half: true, tab: 'Images', help: 'e.g. “center 30%”' }),
      f.text('circleText', 'Rotating circle text', { max: 400, tab: 'Founder card' }),
      f.toggle('showMentorCard', 'Show founder name card', { tab: 'Founder card' }),
      f.text('mentorName', 'Name', { max: 80, half: true, tab: 'Founder card' }),
      f.text('mentorRole', 'Role', { max: 80, half: true, tab: 'Founder card' }),
    ],
  },

  stats: {
    key: 'stats',
    label: 'Statistics counters',
    description: 'The animated numbers (years of experience, students placed, ...).',
    previewPath: '/',
    anchor: 'trust-stats',
    fields: [
      f.toggle('animate', 'Count up the numbers when they scroll into view'),
      f.repeater('items', 'Counters', [
        f.num('number', 'Number', { required: true, min: 0, max: 100000000, half: true }),
        f.text('suffix', 'After the number', { max: 6, half: true, help: 'e.g. “+” or “%”' }),
        f.text('label', 'Label', { required: true, max: 60 }),
      ], { itemLabel: 'Counter', titleField: 'label', maxItems: 8, minItems: 1 }),
    ],
  },

  whyChoose: {
    key: 'whyChoose',
    label: 'Why Choose EDUZY',
    description: 'Introduction, the four feature cards and the orange call-to-action banner.',
    previewPath: '/',
    anchor: 'about',
    fields: [
      f.text('badge', 'Small label above the heading', { max: 60, tab: 'Introduction' }),
      ...sectionTitle().map((x) => ({ ...x, tab: 'Introduction' })),
      f.inline('lead', 'Main paragraph', { tab: 'Introduction' }),
      f.list('paragraphs', 'More paragraphs', { tab: 'Introduction', itemLabel: 'Paragraph', max: 1500 }),
      f.repeater('pillars', 'Feature cards', [
        f.icon('icon', 'Icon', { half: true }),
        f.text('tag', 'Small label', { max: 40, half: true }),
        f.text('title', 'Title', { required: true, max: 120 }),
        f.area('desc', 'Description', { max: 800 }),
        f.list('highlights', 'Bullet points', { itemLabel: 'Bullet', max: 200 }),
      ], { itemLabel: 'Feature card', titleField: 'title', maxItems: 8, tab: 'Feature cards' }),
      f.toggle('showCta', 'Show the call-to-action banner', { tab: 'Banner' }),
      f.text('ctaHeading', 'Banner heading', { max: 160, tab: 'Banner' }),
      f.area('ctaText', 'Banner text', { max: 400, tab: 'Banner' }),
      f.group('ctaPrimary', 'White button', buttonFields(), { tab: 'Banner' }),
      f.text('ctaSecondaryLabel', 'Outline button text', { max: 40, tab: 'Banner', help: 'Opens the enquiry on the Contact page.' }),
    ],
  },

  accreditationSection: {
    key: 'accreditationSection',
    label: 'Accreditation – section text',
    description: 'Heading and description above the accreditation logos.',
    previewPath: '/',
    anchor: 'accreditations',
    fields: [
      f.text('titleLine1', 'Heading line 1', { max: 120 }),
      f.text('titleHighlight', 'Heading line 2 (orange)', { max: 120 }),
      f.area('subtitle', 'Description', { max: 600 }),
    ],
  },

  featuredCourses: {
    key: 'featuredCourses',
    label: 'Featured Courses',
    description: 'Course cards section (optional on the home page).',
    previewPath: '/',
    anchor: 'featured-courses',
    fields: [
      ...sectionTitle(),
      f.area('subtitle', 'Description', { max: 400 }),
      f.select('mode', 'Courses to show', [
        { value: 'featured', label: 'Courses marked “Featured”' },
        { value: 'all', label: 'All published courses' },
      ], { half: true }),
      f.toggle('showFilter', 'Show category filter', { half: true }),
      f.num('initialCount', 'Cards shown before “Load more”', { min: 1, max: 30, half: true }),
      f.text('loadMoreLabel', '“Load more” button text', { max: 40, half: true }),
      f.text('viewAllLabel', '“View all” button text', { max: 40, half: true }),
    ],
  },

  director: {
    key: 'director',
    label: 'Director / Founder Message',
    description: 'Portrait, name, role and message from the founder.',
    previewPath: '/',
    anchor: 'director-message',
    fields: [
      f.text('sideLabel', 'Vertical side label', { max: 60 }),
      f.text('heading', 'Heading', { max: 160 }),
      f.list('paragraphs', 'Message paragraphs', { itemLabel: 'Paragraph', max: 2000, help: 'Quotation marks are added automatically.' }),
      f.text('name', 'Name', { max: 80, half: true }),
      f.text('role', 'Designation', { max: 80, half: true }),
      f.image('image', 'Portrait', { required: true }),
      f.text('imageAlt', 'Portrait description (alt text)', { max: 200 }),
      f.image('signature', 'Signature image', { help: 'Optional. Shown under the name.' }),
    ],
  },

  videoSection: {
    key: 'videoSection',
    label: 'Video stories – section text',
    description: 'Heading above the student video carousel.',
    previewPath: '/',
    anchor: 'video-stories',
    fields: [
      ...sectionTitle(),
      f.area('subtitle', 'Description', { max: 400 }),
      f.text('watchLabel', '“Watch on YouTube” link text', { max: 40 }),
    ],
  },

  testimonialsSection: {
    key: 'testimonialsSection',
    label: 'Testimonials – section text',
    description: 'Heading above the student testimonial cards.',
    previewPath: '/',
    anchor: 'testimonials',
    fields: [
      ...sectionTitle(),
      f.area('subtitle', 'Description', { max: 400 }),
      f.text('videoLinkLabel', '“Watch video” link text', { max: 40, help: 'Shown on testimonials that have a video link.' }),
    ],
  },

  faqSection: {
    key: 'faqSection',
    label: 'FAQ – section text',
    description: 'Heading above the frequently asked questions.',
    previewPath: '/',
    anchor: 'faqs',
    fields: [
      ...sectionTitle(),
      f.area('subtitle', 'Description', { max: 400 }),
      f.toggle('openFirst', 'Open the first question by default'),
    ],
  },

  cta: {
    key: 'cta',
    label: 'Call to Action',
    description: 'The orange “Ready to start?” card shown at the bottom of most pages.',
    previewPath: '/',
    anchor: 'cta',
    fields: [
      f.text('badge', 'Small label', { max: 60 }),
      f.text('heading', 'Heading', { max: 160 }),
      f.area('description', 'Description', { max: 400 }),
      f.group('primary', 'White button', buttonFields('Leave empty to call the website phone number.')),
      f.group('secondary', 'Orange button', [
        ...buttonFields('Leave empty to open WhatsApp with the message below.'),
        f.text('whatsappMessage', 'WhatsApp message', { max: 300 }),
      ]),
      f.list('perks', 'Ticks under the buttons', { itemLabel: 'Tick', max: 60 }),
      f.image('backgroundImage', 'Background image', { help: 'Optional. A dark orange tint is applied so text stays readable.' }),
    ],
  },

  achievements: {
    key: 'achievements',
    label: 'Trust & outcomes cards',
    description: '“Built on Trust, Backed by Results” cards (About page).',
    previewPath: '/about',
    anchor: 'achievements',
    fields: [
      f.text('title', 'Heading', { max: 160 }),
      f.area('subtitle', 'Description', { max: 400 }),
      f.repeater('items', 'Cards', [
        f.icon('icon', 'Icon', { half: true }),
        f.text('tag', 'Small label', { max: 40, half: true }),
        f.text('title', 'Title', { required: true, max: 120 }),
        f.area('desc', 'Description', { max: 500 }),
      ], { itemLabel: 'Card', titleField: 'title', maxItems: 8 }),
    ],
  },

  placementAchievements: {
    key: 'placementAchievements',
    label: 'Student achievements',
    description: 'Placement highlights on the Portfolio / Blogs page.',
    previewPath: '/portfolio',
    anchor: 'achievements-section',
    fields: [
      f.text('tag', 'Small label', { max: 60 }),
      f.text('title', 'Heading', { max: 160 }),
      f.area('subtitle', 'Description', { max: 400 }),
      f.repeater('items', 'Achievements', [
        f.text('badge', 'Badge', { max: 60, half: true }),
        f.text('stat', 'Highlight figure', { max: 60, half: true }),
        f.text('title', 'Title', { required: true, max: 160 }),
        f.area('desc', 'Description', { max: 500 }),
      ], { itemLabel: 'Achievement', titleField: 'title', maxItems: 12 }),
    ],
  },

  // ---------------- Other pages ----------------
  about: {
    key: 'about',
    label: 'About Page',
    description: 'About page heading, mission, vision, core values and which shared sections appear.',
    previewPath: '/about',
    fields: [
      f.toggle('enabled', 'Publish the About page at /about', { tab: 'Page', help: 'When off, /about redirects to the Portfolio page (current website behaviour).' }),
      f.text('heroTitle', 'Page heading', { max: 160, tab: 'Page' }),
      f.area('heroSubtitle', 'Introduction', { max: 1200, tab: 'Page' }),
      f.text('missionSectionTitle', 'Mission & vision section heading', { max: 120, tab: 'Mission & vision' }),
      f.text('missionTitle', 'Mission title', { max: 80, half: true, tab: 'Mission & vision' }),
      f.text('visionTitle', 'Vision title', { max: 80, half: true, tab: 'Mission & vision' }),
      f.area('mission', 'Mission', { max: 800, tab: 'Mission & vision' }),
      f.area('vision', 'Vision', { max: 800, tab: 'Mission & vision' }),
      f.text('valuesTitle', 'Core values heading', { max: 120, tab: 'Core values' }),
      f.repeater('values', 'Core values', [
        f.icon('icon', 'Icon', { half: true }),
        f.text('title', 'Value', { required: true, max: 80, half: true }),
        f.area('desc', 'Description', { max: 400 }),
      ], { itemLabel: 'Value', titleField: 'title', maxItems: 8, tab: 'Core values', help: 'Shown below Mission & Vision when at least one value is added.' }),
      f.group('show', 'Sections on the About page', [
        f.toggle('whyChoose', 'Why Choose EDUZY (shared)', { half: true }),
        f.toggle('stats', 'Statistics counters (shared)', { half: true }),
        f.toggle('accreditation', 'Accreditations (shared)', { half: true }),
        f.toggle('director', 'Founder message (shared)', { half: true }),
        f.toggle('achievements', 'Trust & outcomes cards (shared)', { half: true }),
        f.toggle('mission', 'Mission & vision', { half: true }),
        f.toggle('cta', 'Call to action (shared)', { half: true }),
      ], { tab: 'Sections' }),
    ],
  },

  coursesPage: {
    key: 'coursesPage',
    label: 'Courses page & course details',
    description: 'Courses page heading, enquiry box, and the labels used on every course detail page.',
    previewPath: '/courses',
    fields: [
      ...sectionTitle().map((x) => ({ ...x, tab: 'Courses page' })),
      f.area('subtitle', 'Description', { max: 400, tab: 'Courses page' }),
      f.text('allLabel', '“All courses” filter text', { max: 40, tab: 'Courses page' }),
      f.text('cardButtonLabel', 'Course card button text', { max: 40, tab: 'Courses page', help: 'The button on every course card, e.g. “Explore Course”.' }),
      f.text('enquiryTitle', 'Enquiry box heading', { max: 120, tab: 'Courses page' }),
      f.text('enquirySubtitle', 'Enquiry box text', { max: 200, tab: 'Courses page' }),
      f.group('detail', 'Course detail pages', [
        f.text('learnTitle', '“What you will learn” heading', { max: 80, half: true }),
        f.text('whoTitle', '“Who is this for” heading', { max: 80, half: true }),
        f.toggle('showBenefits', 'Show course benefits'),
        f.text('benefitsTitle', 'Benefits heading', { max: 80, half: true }),
        f.text('galleryTitle', 'Course gallery heading', { max: 80, half: true }),
        f.text('modesTitle', 'Learning modes heading', { max: 80 }),
        f.repeater('modes', 'Learning modes', [
          f.select('icon', 'Icon', [{ value: 'Laptop', label: 'Laptop' }, { value: 'Building2', label: 'Building' }, { value: 'Globe', label: 'Globe' }, { value: 'Users', label: 'People' }], { half: true }),
          f.text('title', 'Title', { required: true, max: 80, half: true }),
          f.area('desc', 'Description', { max: 400 }),
        ], { itemLabel: 'Learning mode', titleField: 'title', maxItems: 4 }),
        f.text('reviewTitle', '“Student review” heading', { max: 80, half: true }),
        f.text('enrollPrefix', 'Enroll button prefix', { max: 40, half: true, help: 'Shown as “<prefix> <course name>”.' }),
        f.text('whatsappLabel', 'WhatsApp button text', { max: 60, half: true }),
        f.text('whatsappMessage', 'WhatsApp message', { max: 300, half: true, help: 'Use {course} to insert the course name.' }),
        f.text('enquirySubtitle', 'Enquiry box text', { max: 200, help: 'Use {course} to insert the course name.' }),
        f.text('formatLabel', '“Training format” label', { max: 40, half: true }),
        f.text('defaultFormat', 'Default training format', { max: 60, half: true }),
        f.text('defaultRating', 'Default rating text', { max: 20, half: true }),
      ], { tab: 'Course detail pages' }),
    ],
  },

  portfolio: {
    key: 'portfolio',
    label: 'Portfolio / Blogs page',
    description: 'Hero, gallery heading, campus facilities and which sections appear on /portfolio and /blogs.',
    previewPath: '/portfolio',
    fields: [
      f.text('heroBadge', 'Small label', { max: 80, tab: 'Hero' }),
      f.text('heroTitleStart', 'Heading', { max: 120, half: true, tab: 'Hero' }),
      f.text('heroTitleHighlight', 'Heading – orange words', { max: 120, half: true, tab: 'Hero' }),
      f.area('heroSubtitle', 'Description', { max: 400, tab: 'Hero' }),
      f.text('linkGallery', 'Jump link – Gallery', { max: 40, half: true, tab: 'Hero' }),
      f.text('linkAchievements', 'Jump link – Achievements', { max: 40, half: true, tab: 'Hero' }),
      f.text('linkCampus', 'Jump link – Campus', { max: 40, half: true, tab: 'Hero' }),
      f.text('galleryTag', 'Small label', { max: 60, tab: 'Gallery' }),
      f.text('galleryTitle', 'Heading', { max: 120, tab: 'Gallery' }),
      f.area('gallerySubtitle', 'Description', { max: 400, tab: 'Gallery' }),
      f.text('galleryAllLabel', '“All” filter text', { max: 30, half: true, tab: 'Gallery' }),
      f.text('galleryViewLabel', '“View photo” text', { max: 30, half: true, tab: 'Gallery' }),
      f.text('campusTag', 'Small label', { max: 60, tab: 'Campus & facilities' }),
      f.text('campusTitle', 'Heading', { max: 120, tab: 'Campus & facilities' }),
      f.area('campusSubtitle', 'Description', { max: 400, tab: 'Campus & facilities' }),
      f.text('campusButtonLabel', 'Card button text', { max: 40, tab: 'Campus & facilities' }),
      f.repeater('facilities', 'Facilities', [
        f.icon('icon', 'Icon'),
        f.text('title', 'Title', { required: true, max: 120 }),
        f.area('desc', 'Description', { max: 500 }),
      ], { itemLabel: 'Facility', titleField: 'title', maxItems: 12, tab: 'Campus & facilities' }),
      f.group('show', 'Sections on this page', [
        f.toggle('journal', 'Blog posts (when published)', { half: true }),
        f.toggle('gallery', 'Photo gallery', { half: true }),
        f.toggle('achievements', 'Student achievements', { half: true }),
        f.toggle('campus', 'Campus & facilities', { half: true }),
        f.toggle('videos', 'Video stories (shared)', { half: true }),
        f.toggle('cta', 'Call to action (shared)', { half: true }),
      ], { tab: 'Sections' }),
    ],
  },

  journal: {
    key: 'journal',
    label: 'Blog listing text',
    description: 'Heading and labels of the blog post list on the Blogs page.',
    previewPath: '/blogs',
    anchor: 'journal-section',
    fields: [
      f.text('tag', 'Small label', { max: 60 }),
      f.text('title', 'Heading', { max: 120 }),
      f.area('subtitle', 'Description', { max: 400 }),
      f.text('readMoreLabel', '“Read article” text', { max: 40, half: true }),
      f.text('backLabel', '“Back to blogs” text', { max: 40, half: true }),
      f.num('perPage', 'Posts shown on the Blogs page', { min: 1, max: 60 }),
    ],
  },

  contact: {
    key: 'contact',
    label: 'Contact Page',
    description: 'Contact page text, the WhatsApp contact form and the course enquiry form.',
    previewPath: '/contact',
    fields: [
      f.text('pageTitle', 'Page heading', { max: 80, tab: 'Page text' }),
      f.text('infoTitle', 'Contact card heading', { max: 80, tab: 'Page text' }),
      f.area('infoText', 'Contact card text', { max: 400, tab: 'Page text' }),
      f.text('phoneLabel', 'Phone label', { max: 40, half: true, tab: 'Page text' }),
      f.text('emailLabel', 'Email label', { max: 40, half: true, tab: 'Page text' }),
      f.text('hoursLabel', 'Hours label', { max: 40, half: true, tab: 'Page text' }),
      f.text('locationLabel', 'Location label', { max: 40, half: true, tab: 'Page text' }),
      f.text('mapTitle', 'Map heading', { max: 80, tab: 'Page text', help: 'Shown when a Google Maps link is set in Global Settings.' }),
      f.group('form', 'Contact form', [
        f.text('eyebrow', 'Small label', { max: 40, half: true }),
        f.text('title', 'Heading', { max: 80, half: true }),
        f.area('text', 'Text under the heading', { max: 300 }),
        f.text('nameLabel', 'Name label', { max: 40, half: true }),
        f.text('namePlaceholder', 'Name placeholder', { max: 60, half: true }),
        f.text('phoneLabel', 'Phone label', { max: 40, half: true }),
        f.text('phonePlaceholder', 'Phone placeholder', { max: 60, half: true }),
        f.text('locationLabel', 'Location label', { max: 40, half: true }),
        f.text('locationPlaceholder', 'Location placeholder', { max: 60, half: true }),
        f.text('locationsMenuTitle', 'Location menu heading', { max: 40, half: true }),
        f.list('locations', 'Locations', { itemLabel: 'Location', max: 60 }),
        f.text('topicLabel', 'Topic label', { max: 40, half: true }),
        f.text('topicPlaceholder', 'Topic placeholder', { max: 60, half: true }),
        f.text('topicsMenuTitle', 'Topic menu heading', { max: 40, half: true }),
        f.list('topics', 'Topics', { itemLabel: 'Topic', max: 60 }),
        f.text('messageLabel', 'Message label', { max: 40, half: true }),
        f.text('messagePlaceholder', 'Message placeholder', { max: 80, half: true }),
        f.text('submitLabel', 'Send button text', { max: 40 }),
        f.text('whatsappIntro', 'First line of the WhatsApp message', { max: 200 }),
        f.text('successTitle', 'Success heading', { max: 80, half: true, help: 'Use {name} for the visitor’s name.' }),
        f.text('successText', 'Success text', { max: 200, half: true }),
        f.text('againLabel', '“Open WhatsApp again” text', { max: 40, half: true }),
        f.text('newLabel', '“New message” text', { max: 40, half: true }),
        f.group('errors', 'Error messages', [
          f.text('name', 'Name missing', { max: 100, half: true }),
          f.text('phone', 'Phone missing', { max: 100, half: true }),
          f.text('phoneInvalid', 'Phone invalid', { max: 100, half: true }),
          f.text('location', 'Location missing', { max: 100, half: true }),
          f.text('topic', 'Topic missing', { max: 100, half: true }),
          f.text('message', 'Message missing', { max: 100, half: true }),
        ]),
      ], { tab: 'Contact form' }),
      f.group('enquiry', 'Course enquiry form (Courses pages)', [
        f.text('title', 'Default heading', { max: 120, half: true }),
        f.text('subtitle', 'Default text', { max: 200, half: true }),
        f.text('nameLabel', 'Name label', { max: 40, half: true }),
        f.text('namePlaceholder', 'Name placeholder', { max: 60, half: true }),
        f.text('phoneLabel', 'Phone label', { max: 40, half: true }),
        f.text('phonePlaceholder', 'Phone placeholder', { max: 60, half: true }),
        f.text('courseLabel', 'Course label', { max: 40, half: true }),
        f.text('coursePlaceholder', 'Course placeholder', { max: 60, half: true }),
        f.text('submitLabel', 'Send button text', { max: 40, half: true }),
        f.text('submittingLabel', 'Sending text', { max: 40, half: true }),
        f.text('successTitle', 'Success heading', { max: 80, help: 'Use {name}.' }),
        f.text('successText', 'Success text', { max: 300, help: 'Use {course} and {phone}.' }),
        f.text('anotherLabel', '“Submit another” text', { max: 40, half: true }),
        f.text('directLabel', '“Or reach us directly” text', { max: 60, half: true }),
        f.text('whatsappLabel', 'WhatsApp button text', { max: 40, half: true }),
        f.text('callLabel', 'Call button text', { max: 40, half: true }),
        f.text('whatsappMessage', 'WhatsApp message', { max: 300 }),
      ], { tab: 'Course enquiry form' }),
    ],
  },

  quickContact: {
    key: 'quickContact',
    label: 'Quick contact & floating buttons',
    description: 'The “Connect With Us” page, the popup and the floating call / chat buttons.',
    previewPath: '/quick-contact',
    fields: [
      f.text('title', 'Heading', { max: 80 }),
      f.text('subtitle', 'Text', { max: 200 }),
      f.repeater('channels', 'Channels', [
        f.select('type', 'Channel', [
          { value: 'whatsapp', label: 'WhatsApp' }, { value: 'instagram', label: 'Instagram' },
          { value: 'youtube', label: 'YouTube' }, { value: 'call', label: 'Phone call' },
        ], { half: true }),
        f.toggle('visible', 'Show', { half: true }),
        f.text('name', 'Name', { required: true, max: 40, half: true }),
        f.text('subtitle', 'Text', { max: 80, half: true }),
      ], { itemLabel: 'Channel', titleField: 'name', maxItems: 4, help: 'Links come from Global Settings → Contact & social.' }),
      f.text('whatsappMessage', 'WhatsApp message', { max: 300 }),
      f.text('comingSoonBanner', 'YouTube “coming soon” banner', { max: 80 }),
      f.text('comingSoonText', 'YouTube “coming soon” text', { max: 80, half: true }),
      f.text('comingSoonPill', 'YouTube “coming soon” badge', { max: 30, half: true }),
      f.toggle('showFloating', 'Show floating call & chat buttons'),
      f.text('connectTooltip', 'Chat button tooltip', { max: 60, half: true }),
      f.text('callTooltip', 'Call button tooltip', { max: 60, half: true, help: 'Use {phone} for the phone number.' }),
    ],
  },
};

// ---------------------------------------------------------------------------
// COLLECTIONS
// ---------------------------------------------------------------------------

export const COLLECTIONS: Record<string, CollectionDef> = {
  courses: {
    name: 'courses',
    label: 'Courses',
    singular: 'Course',
    description: 'All diploma programmes, their detail pages and SEO.',
    titleField: 'name',
    subtitleField: 'shortDesc',
    imageField: 'image',
    slugField: 'slug',
    slugFrom: 'name',
    searchFields: ['name', 'shortDesc', 'slug', 'badge'],
    filterField: 'category',
    filterOptionsFrom: 'courseCategories',
    previewPath: (c) => `/courses/${c.slug || ''}`,
    fullPageEditor: true,
    fields: [
      f.text('name', 'Course title', { required: true, max: 200, tab: 'Basics' }),
      { name: 'slug', label: 'Page address (slug)', type: 'slug', required: true, max: 120, tab: 'Basics', help: 'The course page lives at /courses/<slug>. Changing it changes the page address.' },
      f.list('aliases', 'Old / alternative addresses', { tab: 'Basics', itemLabel: 'Slug', max: 120, help: 'Older slugs that should still open this course.' }),
      { name: 'category', label: 'Main category', type: 'select', optionsFrom: 'courseCategories', required: true, half: true, tab: 'Basics' },
      { name: 'categories', label: 'Also show under', type: 'multiselect', optionsFrom: 'courseCategories', half: true, tab: 'Basics' },
      f.text('badge', 'Course badge', { max: 40, half: true, tab: 'Basics', help: 'e.g. Bestseller, High Placement' }),
      f.toggle('featured', 'Featured course', { half: true, tab: 'Basics', help: 'Shown in the Featured Courses section.' }),
      f.area('shortDesc', 'Short description (course card)', { required: true, max: 400, tab: 'Basics' }),
      f.area('description', 'Full description (course page)', { rows: 6, max: 3000, tab: 'Basics' }),
      f.text('duration', 'Duration', { max: 60, half: true, tab: 'Details' }),
      f.text('level', 'Course level', { max: 120, half: true, tab: 'Details' }),
      f.text('format', 'Learning format', { max: 60, half: true, tab: 'Details' }),
      f.num('rating', 'Rating (out of 5)', { min: 0, max: 5, half: true, tab: 'Details' }),
      f.list('whoIsItFor', 'Who is this course for?', { itemLabel: 'Audience', max: 300, tab: 'Details' }),
      f.list('whatYouLearn', 'What you will learn', { itemLabel: 'Topic', max: 300, tab: 'Details' }),
      f.list('benefits', 'Course benefits', { itemLabel: 'Benefit', max: 300, tab: 'Details' }),
      f.image('image', 'Course image', { required: true, tab: 'Images' }),
      f.text('imageAlt', 'Image description (alt text)', { max: 240, tab: 'Images' }),
      f.text('imagePosition', 'Image focus position', { max: 40, tab: 'Images', help: 'Which part of the image stays visible when cropped, e.g. “center 30%”.' }),
      { name: 'gallery', label: 'Gallery images', type: 'images', tab: 'Images', help: 'Optional extra photos shown on the course page.' },
      f.group('seo', 'SEO', seoFields.filter((x) => x.name !== 'noindex'), { tab: 'SEO', help: 'Leave empty to generate from the course title and description.' }),
    ],
  },

  courseCategories: {
    name: 'courseCategories',
    label: 'Course Categories',
    singular: 'Category',
    description: 'Filter tabs on the Courses page.',
    titleField: 'label',
    slugField: 'slug',
    slugFrom: 'label',
    searchFields: ['label', 'slug'],
    previewPath: () => '/courses',
    publishWord: { on: 'Visible', off: 'Hidden' },
    fields: [
      f.text('label', 'Category name', { required: true, max: 60 }),
      { name: 'slug', label: 'Category ID (used in links)', type: 'slug', required: true, max: 60, help: 'Used in /courses?category=<id>. Avoid changing it after launch.' },
    ],
  },

  blogs: {
    name: 'blogs',
    label: 'Blogs / Journal',
    singular: 'Blog post',
    description: 'Articles shown on the Blogs page with their own pages.',
    titleField: 'title',
    subtitleField: 'excerpt',
    imageField: 'coverImage',
    slugField: 'slug',
    slugFrom: 'title',
    searchFields: ['title', 'excerpt', 'author', 'slug'],
    filterField: 'category',
    filterOptionsFrom: 'blogCategories',
    previewPath: (b) => `/blogs/${b.slug || ''}`,
    fullPageEditor: true,
    fields: [
      f.text('title', 'Title', { required: true, max: 200, tab: 'Article' }),
      { name: 'slug', label: 'Page address (slug)', type: 'slug', required: true, max: 140, tab: 'Article', help: 'The post lives at /blogs/<slug>.' },
      f.area('excerpt', 'Excerpt', { max: 400, tab: 'Article', help: 'Short summary shown on the blog list.' }),
      f.rich('content', 'Content', { required: true, tab: 'Article' }),
      f.image('coverImage', 'Cover image', { tab: 'Details' }),
      f.text('coverAlt', 'Cover image description (alt text)', { max: 200, tab: 'Details' }),
      f.text('author', 'Author', { max: 80, half: true, tab: 'Details' }),
      { name: 'publishDate', label: 'Publish date', type: 'date', half: true, tab: 'Details' },
      { name: 'category', label: 'Category', type: 'select', optionsFrom: 'blogCategories', half: true, tab: 'Details' },
      f.toggle('featured', 'Featured post', { half: true, tab: 'Details' }),
      f.list('tags', 'Tags', { itemLabel: 'Tag', max: 40, tab: 'Details' }),
      f.group('seo', 'SEO', seoFields.filter((x) => x.name !== 'noindex'), { tab: 'SEO', help: 'Leave empty to use the title and excerpt.' }),
    ],
  },

  blogCategories: {
    name: 'blogCategories',
    label: 'Blog categories',
    singular: 'Category',
    description: 'Categories for blog posts.',
    titleField: 'label',
    slugField: 'slug',
    slugFrom: 'label',
    searchFields: ['label'],
    previewPath: () => '/blogs',
    publishWord: { on: 'Visible', off: 'Hidden' },
    fields: [
      f.text('label', 'Category name', { required: true, max: 60 }),
      { name: 'slug', label: 'Category ID', type: 'slug', required: true, max: 60 },
    ],
  },

  gallery: {
    name: 'gallery',
    label: 'Gallery',
    singular: 'Photo',
    description: 'Photos in the Academy Photo Gallery.',
    titleField: 'title',
    subtitleField: 'description',
    imageField: 'image',
    searchFields: ['title', 'alt', 'description'],
    filterField: 'category',
    filterOptionsFrom: 'galleryCategories',
    previewPath: () => '/portfolio',
    anchor: 'gallery-section',
    fields: [
      f.image('image', 'Photo', { required: true }),
      f.text('title', 'Title', { required: true, max: 120 }),
      f.text('alt', 'Image description (alt text)', { max: 240, help: 'Describe the photo for screen readers and Google.' }),
      f.area('description', 'Caption', { max: 500, help: 'Optional. Shown in the enlarged view.' }),
      { name: 'category', label: 'Category', type: 'select', optionsFrom: 'galleryCategories', required: true },
    ],
  },

  galleryCategories: {
    name: 'galleryCategories',
    label: 'Gallery categories',
    singular: 'Category',
    description: 'Filter tabs of the photo gallery.',
    titleField: 'label',
    slugField: 'slug',
    slugFrom: 'label',
    searchFields: ['label'],
    previewPath: () => '/portfolio',
    anchor: 'gallery-section',
    publishWord: { on: 'Visible', off: 'Hidden' },
    fields: [
      f.text('label', 'Filter tab text', { required: true, max: 60, half: true }),
      f.text('badgeLabel', 'Badge text on photos', { max: 60, half: true, help: 'Leave empty to reuse the tab text.' }),
      { name: 'slug', label: 'Category ID', type: 'slug', required: true, max: 60 },
    ],
  },

  testimonials: {
    name: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    description: 'Written student reviews.',
    titleField: 'name',
    subtitleField: 'text',
    imageField: 'image',
    searchFields: ['name', 'role', 'course', 'text'],
    previewPath: () => '/',
    anchor: 'testimonials',
    fields: [
      f.text('name', 'Student name', { required: true, max: 80, half: true }),
      f.text('role', 'Role / job title', { max: 120, half: true }),
      f.text('course', 'Course', { max: 200 }),
      f.area('text', 'Review', { required: true, max: 1200 }),
      f.num('rating', 'Rating (1–5 stars)', { required: true, min: 1, max: 5, half: true }),
      f.text('initials', 'Initials (shown when there is no photo)', { max: 3, half: true }),
      f.image('image', 'Profile photo'),
      f.url('videoUrl', 'Video testimonial link', { help: 'Optional YouTube link.' }),
    ],
  },

  videoTestimonials: {
    name: 'videoTestimonials',
    label: 'Video stories',
    singular: 'Video story',
    description: 'Student video reels carousel.',
    titleField: 'studentName',
    subtitleField: 'title',
    imageField: 'thumbnail',
    searchFields: ['studentName', 'course', 'title', 'achievement'],
    previewPath: () => '/',
    anchor: 'video-stories',
    fields: [
      f.text('studentName', 'Student name', { required: true, max: 80, half: true }),
      f.text('course', 'Course', { max: 120, half: true }),
      f.text('title', 'Story title / quote', { max: 200 }),
      f.url('videoUrl', 'YouTube link', { required: true }),
      f.image('thumbnail', 'Thumbnail', { help: 'Leave empty to use the YouTube thumbnail.' }),
      f.text('badge', 'Badge', { max: 40, half: true }),
      f.text('duration', 'Duration', { max: 10, half: true }),
      f.text('achievement', 'Achievement', { max: 120, half: true }),
      f.text('destination', 'Company / destination', { max: 120, half: true }),
    ],
  },

  faqs: {
    name: 'faqs',
    label: 'FAQ',
    singular: 'Question',
    description: 'Frequently asked questions.',
    titleField: 'question',
    subtitleField: 'answer',
    searchFields: ['question', 'answer'],
    previewPath: () => '/',
    anchor: 'faqs',
    fields: [
      f.text('question', 'Question', { required: true, max: 300 }),
      f.area('answer', 'Answer', { required: true, rows: 5, max: 3000 }),
    ],
  },

  accreditations: {
    name: 'accreditations',
    label: 'Accreditation',
    singular: 'Logo',
    description: 'Accreditation, certification and partner logos.',
    titleField: 'name',
    imageField: 'image',
    searchFields: ['name'],
    filterField: 'group',
    previewPath: () => '/',
    anchor: 'accreditations',
    publishWord: { on: 'Enabled', off: 'Disabled' },
    fields: [
      f.image('image', 'Logo', { required: true }),
      f.text('name', 'Name (alt text)', { required: true, max: 200 }),
      f.select('group', 'Row', [
        { value: 'primary', label: 'Top row – international certificates (large)' },
        { value: 'partner', label: 'Partner logos' },
      ], { required: true }),
    ],
  },
};

export const ACCREDITATION_GROUPS = [
  { value: 'primary', label: 'International certificates' },
  { value: 'partner', label: 'Partner logos' },
];

/** Home page section types an admin can place on the home page. */
export const HOME_SECTION_TYPES: Record<string, { label: string; singleton?: string; adminPath: string; repeatable?: boolean; description: string }> = {
  hero: { label: 'Hero', singleton: 'hero', adminPath: '/admin/pages/home/hero', description: 'Headline, buttons and founder image' },
  stats: { label: 'Statistics counters', singleton: 'stats', adminPath: '/admin/achievements?tab=stats', description: 'Animated numbers' },
  whyChoose: { label: 'Why Choose EDUZY', singleton: 'whyChoose', adminPath: '/admin/pages/home/whyChoose', description: 'Introduction and feature cards' },
  accreditation: { label: 'Accreditation', singleton: 'accreditationSection', adminPath: '/admin/accreditation', description: 'Certificates and partner logos' },
  featuredCourses: { label: 'Featured Courses', singleton: 'featuredCourses', adminPath: '/admin/pages/home/featuredCourses', description: 'Course cards' },
  director: { label: 'Director / Founder Message', singleton: 'director', adminPath: '/admin/pages/home/director', description: 'Founder portrait and message' },
  videoStories: { label: 'Video stories', singleton: 'videoSection', adminPath: '/admin/testimonials?tab=videos', description: 'Student video carousel' },
  testimonials: { label: 'Testimonials', singleton: 'testimonialsSection', adminPath: '/admin/testimonials', description: 'Student review cards' },
  achievements: { label: 'Trust & outcomes cards', singleton: 'achievements', adminPath: '/admin/achievements?tab=trust', description: 'Results cards with icons' },
  faq: { label: 'FAQ', singleton: 'faqSection', adminPath: '/admin/faq', description: 'Questions and answers' },
  cta: { label: 'Call to Action', singleton: 'cta', adminPath: '/admin/pages/home/cta', description: 'Orange enrolment card' },
  richText: { label: 'Custom text block', adminPath: '', repeatable: true, description: 'Your own heading, text, image and button' },
};

export const richTextBlockFields: Field[] = [
  f.text('tag', 'Small label', { max: 60 }),
  f.text('heading', 'Heading', { required: true, max: 160 }),
  f.rich('body', 'Text'),
  f.image('image', 'Image'),
  f.select('imageSide', 'Image position', [{ value: 'right', label: 'Right of the text' }, { value: 'left', label: 'Left of the text' }], { half: true }),
  f.select('background', 'Background', [{ value: 'white', label: 'White' }, { value: 'light', label: 'Light orange' }], { half: true }),
  f.text('buttonLabel', 'Button text', { max: 40, half: true }),
  f.url('buttonUrl', 'Button link', { half: true }),
];

export function getSingletonDef(key: string): SingletonDef | undefined {
  return Object.prototype.hasOwnProperty.call(SINGLETONS, key) ? SINGLETONS[key] : undefined;
}
export function getCollectionDef(name: string): CollectionDef | undefined {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, name) ? COLLECTIONS[name] : undefined;
}
