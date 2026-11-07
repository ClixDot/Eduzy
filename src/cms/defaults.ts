/**
 * Default content = the EDUZY website exactly as it was before the CMS.
 * Used to seed the database and as a fallback for any field that has never been edited.
 */
import { courses as seedCourses, courseCategories as seedCourseCategories } from '../data/courses';
import seedTestimonials from '../data/testimonials';
import seedVideoTestimonials from '../data/videoTestimonials';
import seedFaqs from '../data/faqs';

const PHONE = '+916235210100';

export const SINGLETON_DEFAULTS: Record<string, any> = {
  settings: {
    siteName: 'EDUZY',
    legalName: 'EDUZY Global Academy',
    tagline: 'Campus to Career',
    siteUrl: 'https://eduzycampus.com',
    logo: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040607/eduzy/logo/logo.png',
    logoAlt: 'EDUZY - Campus to Career',
    favicon: '/favicon.svg',
    organizationDescription:
      'Industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Fashion & Interior Designing, Hospital Administration, and Aviation.',
    colors: { primary: '#FF3B0B', primaryDark: '#E62E00', primaryLight: '#FFF7ED', text: '#374151' },
    typography: { bodyFont: 'Inter', headingFont: 'Plus Jakarta Sans', headingWeight: '800' },
    contact: {
      phone: PHONE,
      phoneDisplay: '+91 62352 10100',
      whatsapp: '916235210100',
      email: 'eduzycampus@gmail.com',
      address: 'Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, Idukki',
      hours: 'Mon – Sat: 9:00 AM – 6:00 PM',
      mapUrl: '',
      region: 'Kerala',
      country: 'IN',
      areaServed: ['Thrissur', 'Palakkad', 'Kannur', 'Trivandrum', 'Calicut', 'Kochi', 'Idukki'],
    },
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      youtubeComingSoon: true,
      linkedin: '',
      twitter: '',
    },
    announcement: { enabled: false, text: '', linkLabel: '', linkUrl: '', dismissible: true },
    popup: { enabled: false, title: '', message: '', image: '', buttonLabel: '', buttonUrl: '', delaySeconds: 5, frequency: 'session' },
    maintenance: {
      enabled: false,
      title: 'We’ll be back shortly',
      message: 'The EDUZY website is being updated. For admissions, call or WhatsApp us — we are happy to help.',
    },
  },

  seo: {
    defaults: {
      title: 'EDUZY | AI-Integrated International Diplomas & Professional Training',
      description:
        'EDUZY offers industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation in Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
      keywords:
        'EDUZY, Campus to Career, Logistics diploma, Accounting course, Digital Marketing, Fashion Designing, Interior Designing, Hospital Administration, Aviation, Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, Idukki, Kerala',
      ogImage: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040609/eduzy/hero/hero-student.jpg',
      themeColor: '#FF3B0B',
    },
    home: { title: 'EDUZY | AI-Integrated International Diplomas & Professional Training', canonical: 'https://eduzycampus.com/' },
    courses: {
      title: 'AI-Integrated International Diploma Courses | EDUZY',
      description:
        'Explore industry-certified international diploma programs at EDUZY in Logistics, Accounting, Digital Marketing, Fashion & Interior Designing, Hospital Administration, and Aviation.',
    },
    blogs: { title: 'Campus Life & Updates | EDUZY' },
    portfolio: {
      title: 'Campus Life, Placements & Gallery | EDUZY',
      description:
        'Explore EDUZY student activities, campus infrastructure, industrial visits, placement drives, convocation ceremonies, and achievements.',
    },
    contact: {
      title: 'Contact Us | EDUZY Global Academy',
      description:
        'Get in touch with EDUZY campus admissions across Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
    },
    quickContact: { title: 'Connect With Us | EDUZY Global Academy' },
    about: { title: 'About EDUZY | Campus to Career' },
  },

  header: {
    visible: true,
    logo: '',
    logoAlt: 'EDUZY - Campus to Career',
    navItems: [
      { label: 'Home', url: '/', visible: true },
      { label: 'Courses', url: '/courses', visible: true },
      { label: 'Blogs', url: '/blogs', visible: true },
      { label: 'Contact', url: '/contact', visible: true },
    ],
    showCta: true,
    ctaLabel: 'Enroll Now',
    ctaUrl: '/contact',
    showMobileCall: true,
    mobileCallLabel: 'Call Us',
  },

  footer: {
    visible: true,
    logo: '',
    description: 'Industry-led executive programs in digital marketing, creator growth, and business leadership across Kerala.',
    showSocials: true,
    navHeading: 'Navigation',
    navLinks: [
      { label: 'Home', url: '/' },
      { label: 'All Courses', url: '/courses' },
      { label: 'Blogs', url: '/blogs' },
      { label: 'Contact', url: '/contact' },
    ],
    programsHeading: 'Top Programs',
    programsSource: 'courses',
    customPrograms: [],
    programsInitialCount: 4,
    contactHeading: 'Contact Campus',
    cta: { enabled: false, heading: 'Ready to build your global career?', buttonLabel: 'Talk to an advisor', buttonUrl: '/contact' },
    copyrightName: 'EDUZY Global Academy',
    copyrightSuffix: 'All Rights Reserved.',
    showPoweredBy: true,
    poweredByLabel: 'clixdot',
    poweredByUrl: 'https://clixdot.com',
    legalLinks: [
      { label: 'Privacy Policy', url: '/' },
      { label: 'Terms & Conditions', url: '/' },
      { label: 'Sitemap', url: '/' },
    ],
    backToTopLabel: 'Back to top',
  },

  home: {
    sections: [
      { id: 'hero', type: 'hero', enabled: true },
      { id: 'stats', type: 'stats', enabled: true },
      { id: 'whyChoose', type: 'whyChoose', enabled: true },
      { id: 'accreditation', type: 'accreditation', enabled: true },
      { id: 'featuredCourses', type: 'featuredCourses', enabled: false },
      { id: 'director', type: 'director', enabled: true },
      { id: 'videoStories', type: 'videoStories', enabled: true },
      { id: 'testimonials', type: 'testimonials', enabled: true },
      { id: 'faq', type: 'faq', enabled: true },
      { id: 'cta', type: 'cta', enabled: true },
    ],
    blocks: {},
  },

  hero: {
    line1Start: 'From Campus to',
    line1Highlight: 'Career.',
    line2Start: 'Build Your',
    line2Highlight: 'Global Future.',
    description:
      'AI-Integrated International Diploma programs in <strong>Logistics, Accounting, Digital Marketing, Designing, Hospital Administration</strong>, and <strong>Aviation</strong> to build your global career.',
    primaryButton: { label: 'Explore Courses', url: '/courses' },
    secondaryButton: { label: 'Enroll Now', url: '' },
    portraitImage: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040613/eduzy/hero/new-website.png',
    portraitAlt: 'Rose Mary Johnson - Founder & CEO of Eduzy',
    portraitFit: 'original',
    portraitPosition: '',
    mobileImage: '',
    backgroundImage: '',
    backgroundPosition: '',
    circleText:
      '• EDUZY GLOBAL ACADEMY • CAMPUS TO CAREER • 10+ YEARS EXCELLENCE • BUILD YOUR GLOBAL FUTURE • EDUZY GLOBAL ACADEMY • CAMPUS TO CAREER • 10+ YEARS EXCELLENCE • BUILD YOUR GLOBAL FUTURE •',
    showMentorCard: true,
    mentorName: 'Rose Mary Johnson',
    mentorRole: 'Founder & CEO Eduzy',
  },

  stats: {
    animate: true,
    items: [
      { number: 15, suffix: '+', label: 'Years of Experience' },
      { number: 40000, suffix: '+', label: 'Students Placed' },
      { number: 97, suffix: '+', label: 'Placement Partners' },
      { number: 25, suffix: '+', label: 'Awards Won' },
    ],
  },

  whyChoose: {
    badge: 'Why Choose Eduzy?',
    titleStart: 'From Campus to',
    titleHighlight: 'Career',
    lead:
      'Eduzy bridges the gap between education and employment through industry-oriented training, hands-on practical learning, skill development, and career-focused guidance. With <strong>15+ years of experience</strong>, <strong>40,000+ students placed</strong>, <strong>97+ placement partners</strong>, and <strong>25+ awards won</strong>, we are committed to empowering students with the skills and confidence needed to succeed in a competitive professional environment.',
    paragraphs: [
      'By combining live software tools, real-world case simulations, and personalized 1-on-1 mentorship, Eduzy helps students build industry-relevant skills, gain practical experience, improve confidence, and prepare for successful careers in today’s dynamic global economy.',
      'Our dedicated career advancement cell actively bridges the final step into the corporate world. Through specialized portfolio branding, rigorous mock HR rounds, and priority recruitment drives with leading multinational partners, we ensure our graduates transition seamlessly into rewarding, high-growth professional roles across India and abroad.',
    ],
    pillars: [
      {
        icon: 'Briefcase',
        tag: 'Industry-Oriented',
        title: 'Industry-Oriented Curriculum & Training',
        desc: 'Our programs are engineered directly around modern market demands. Students learn on the exact tools, commercial workflows, and corporate standards required in Logistics, Corporate Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation to build industry-relevant skills.',
        highlights: [
          'Hands-on mastery of SAP, TallyPrime, Advanced Excel, Meta Ads & Figma',
          'Curriculum continually reviewed and updated with top enterprise partners',
          'Dual government-approved accreditations (NSDC, NCVET & University tie-ups)',
        ],
      },
      {
        icon: 'Target',
        tag: 'Practical Learning',
        title: 'Hands-On, Practical Learning Beyond Theory',
        desc: 'We replace passive textbook lectures with experiential workshop learning. Students actively solve real business case studies, operate live software environments, and execute client assignments to gain practical experience and genuine on-the-job competency.',
        highlights: [
          '70% practical computer lab exercises and 30% conceptual foundations',
          'Capstone projects & verified portfolio building before graduation',
          'Interactive classroom sessions guided by seasoned industry practitioners',
        ],
      },
      {
        icon: 'Users',
        tag: 'Skill & Confidence',
        title: 'Skill Development & Career-Focused Guidance',
        desc: 'Technical proficiency is paired with comprehensive professional grooming. Our dedicated mentoring cell helps students improve confidence, workplace communication, and soft skills to prepare for long-term career success.',
        highlights: [
          '1-on-1 resume optimization, portfolio review & LinkedIn profile branding',
          'Intensive mock HR interviews, technical tests & group discussions',
          'Corporate etiquette, English speaking confidence & workplace ethics',
        ],
      },
      {
        icon: 'Award',
        tag: 'Verified Outcomes',
        title: 'Proven Placement Network & Track Record',
        desc: 'Backed by 15+ years of educational excellence, 97+ corporate hiring partnerships, and 25+ awards won, Eduzy creates direct placement pathways into leading corporate enterprises and multinational firms.',
        highlights: [
          '40,000+ alumni working across leading corporate and healthcare sectors',
          'On-campus recruitment drives & priority referral interview rounds',
          'Dedicated placement coordinator support until successful job onboarding',
        ],
      },
    ],
    showCta: true,
    ctaHeading: 'Ready to Bridge the Gap Between Education and Employment?',
    ctaText:
      'Get personalized career counseling, choose the right industry program, and start your journey toward high-growth job placements.',
    ctaPrimary: { label: 'Explore Programs', url: '/courses' },
    ctaSecondaryLabel: 'Free Counseling',
  },

  accreditationSection: {
    titleLine1: 'International Certifications &',
    titleHighlight: 'University Recognitions',
    subtitle:
      'EDUZY training programs are internationally validated, government-regulated, and university-recognized — ensuring your credentials are accepted for global corporate employment, embassy attestation, and international careers.',
  },

  featuredCourses: {
    titleStart: 'Featured',
    titleHighlight: 'Programs',
    subtitle: 'Industry-focused programs designed to develop professional skills and prepare learners for career opportunities.',
    mode: 'all',
    showFilter: true,
    initialCount: 6,
    loadMoreLabel: 'Load More Courses',
    viewAllLabel: 'View All Courses',
  },

  director: {
    sideLabel: 'Leadership • Estd 2014',
    heading: 'Guiding Every Student to Their Global Potential',
    paragraphs: [
      'At EDUZY, our mission has always been clear and heartfelt: to bridge the gap between ambitious students and high-growth professional careers. Whether you are stepping into global logistics, corporate accounting, digital marketing, creative design, hospital administration, or aviation, industry preparation is about hands-on practical skills, confidence, and dedicated mentorship.',
      'Every student who enters our doors or logs into our virtual classroom receives our wholehearted dedication. We have carefully curated our faculty, materials, and small batch sizes to ensure no one is left behind. When you succeed, we celebrate your victory as our own.',
    ],
    name: 'Rose Mary Johnson',
    role: 'Founder & CEO Eduzy',
    image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040615/eduzy/directors/the.png',
    imageAlt: 'Rose Mary Johnson, Founder & CEO of Eduzy',
    signature: '',
  },

  videoSection: {
    titleStart: 'Inspiring Journeys,',
    titleHighlight: 'Global Careers',
    subtitle:
      'Watch verified EDUZY alumni share how industry-led diploma training and practical mentorship helped them build successful global careers.',
    watchLabel: 'Watch on YouTube',
  },

  testimonialsSection: {
    titleStart: 'What Our Students',
    titleHighlight: 'Say',
    subtitle:
      'Hear directly from healthcare professionals and students who transformed their global career aspirations with EDUZY.',
    videoLinkLabel: 'Watch video',
  },

  faqSection: {
    titleStart: 'Frequently Asked',
    titleHighlight: 'Questions',
    subtitle: 'Find answers to common questions about our courses, training methodology, and enrollment process.',
    openFirst: true,
  },

  cta: {
    badge: 'Start Your Transformation',
    heading: 'Ready to Start Your Success Journey?',
    description:
      'Take the next step toward your academic and career goals. Join thousands of successful candidates who trusted EDUZY.',
    primary: { label: 'Call Now', url: '' },
    secondary: { label: 'Message', url: '', whatsappMessage: 'Hello EDUZY, I would like to enquire about admissions' },
    perks: ['Free Consultation', 'Flexible Batches', 'Online & Offline Available'],
    backgroundImage: '',
  },

  achievements: {
    title: 'Built on Trust, Backed by Results',
    subtitle: 'We focus on genuine educational quality, rigorous mock training, and ethical career guidance.',
    items: [
      { icon: 'Star', tag: 'Career Placements', title: '96% Verified Placement Success', desc: 'Consistently achieving top-tier career placements across the UK, Australia, Germany, UAE, and overseas.' },
      { icon: 'CircleCheckBig', tag: 'Proven Outcomes', title: 'International Diploma Certifications', desc: 'Students achieve internationally validated diploma qualifications and high-growth industry placements.' },
      { icon: 'MapPin', tag: 'International Reach', title: 'Global Career Placements', desc: 'Our alumni work across leading logistics hubs, corporate finance firms, agencies, hospitals, and airlines worldwide.' },
      { icon: 'Clock', tag: 'Personalized Support', title: 'Continuous Individual Mentorship', desc: 'One-on-one speaking corrections, letter reviews, and dedicated doubt-clearing sessions daily.' },
    ],
  },

  placementAchievements: {
    tag: 'Proven Track Record',
    title: 'Student Achievements',
    subtitle: 'Thousands of healthcare professionals have achieved their dream scores on their first attempt.',
    items: [
      { title: 'Logistics & Supply Chain Qualifiers', stat: '950+ Certified', badge: 'Logistics Excellence', desc: 'Graduates securing high-demand roles in global shipping lines, freight forwarding, and supply chain hubs.' },
      { title: 'Accounting & Corporate Finance Specialists', stat: '1,200+ Placed', badge: 'Accounting Mastery', desc: 'Certified professionals equipped with Tally, GST, SAP, and computerized accounting across corporate firms.' },
      { title: 'Digital Marketing & Creative Designers', stat: '850+ Placed', badge: 'Creative & Tech Hub', desc: 'Graduates excelling in performance marketing, fashion styling, interior CAD drafting, and brand design.' },
      { title: 'Hospital Admin & Aviation Graduates', stat: '98.4% Placement Rate', badge: 'Global Careers', desc: 'Diploma holders placed across leading healthcare networks and international airport operations.' },
    ],
  },

  about: {
    enabled: false,
    heroTitle: 'Dedicated to Your Global Career',
    heroSubtitle:
      'Eduzy bridges the gap between education and employment through industry-oriented training, hands-on practical learning, skill development, and career-focused guidance. With 15+ years of experience, 40,000+ students placed, 97+ placement partners, and 25+ awards won, we empower students to build industry-relevant skills, gain practical experience, improve confidence, and prepare for successful global careers.',
    missionSectionTitle: 'Our Vision & Core Mission',
    missionTitle: 'Our Mission',
    mission:
      'To empower students with industry-oriented skills, hands-on practical training, and career-focused mentorship needed to succeed in a competitive professional environment.',
    visionTitle: 'Our Vision',
    vision:
      'To be the most trusted and result-oriented career training academy in India, celebrated for authentic mentor guidance, cutting-edge teaching methodologies, and life-changing student success stories.',
    valuesTitle: 'Our Core Values',
    values: [],
    show: { whyChoose: true, stats: true, accreditation: true, director: true, achievements: true, mission: true, cta: true },
  },

  coursesPage: {
    titleStart: 'Explore All',
    titleHighlight: 'Courses',
    subtitle: 'Industry-focused programs designed to develop professional skills and prepare learners for career opportunities.',
    allLabel: 'All Courses',
    cardButtonLabel: 'Explore Course',
    enquiryTitle: 'Need Help Choosing a Course?',
    enquirySubtitle: 'Leave your details and our team will get in touch with you.',
    detail: {
      learnTitle: 'What You Will Learn',
      whoTitle: 'Who Is This Course For?',
      showBenefits: false,
      benefitsTitle: 'Course Benefits',
      galleryTitle: 'Course Gallery',
      modesTitle: 'Flexible Learning Modes',
      modes: [
        { icon: 'Laptop', title: 'Online Live Interactive', desc: 'Live face-to-face online sessions with direct mentor doubts clearing, study materials, and full recording access.' },
        { icon: 'Building2', title: 'Classroom Coaching', desc: 'Physical classroom training in modern lecture rooms, interactive labs, and direct peer group discussions with trainers and mentors.' },
      ],
      reviewTitle: 'Student Review',
      enrollPrefix: 'Enroll in',
      whatsappLabel: 'Chat on WhatsApp',
      whatsappMessage: 'Hi, I would like more information about the {course} course',
      enquirySubtitle: 'Secure your seat for the upcoming {course} batch at EDUZY.',
      formatLabel: 'Training Format',
      defaultFormat: 'Online & Offline',
      defaultRating: '4.8 / 5.0',
    },
  },

  portfolio: {
    heroBadge: 'Campus Life, Achievements & Gallery',
    heroTitleStart: 'Life at EDUZY:',
    heroTitleHighlight: 'Portfolio & Achievements',
    heroSubtitle:
      'Explore our state-of-the-art campus infrastructure, clinical simulation labs, student celebrations, and global healthcare career milestones.',
    linkGallery: 'Gallery',
    linkAchievements: 'Achievements',
    linkCampus: 'Campus & Labs',
    galleryTag: 'Visual Showcase',
    galleryTitle: 'Academy Photo Gallery',
    gallerySubtitle: 'Browse classroom sessions, testing labs, cultural events, and graduation celebrations at EDUZY academy.',
    galleryAllLabel: 'All',
    galleryViewLabel: 'View Photo',
    campusTag: 'Infrastructure',
    campusTitle: 'Modern Campus & Facilities',
    campusSubtitle: 'Designed from the ground up to offer the most conducive environment for language learning and test preparation.',
    campusButtonLabel: 'Book Campus Visit',
    facilities: [
      { icon: 'Monitor', title: 'CBT Computer Mock Lab', desc: 'Equipped with 50+ high-performance workstations, licensed software, and studio headphones simulating real Pearson VUE & CD-IELTS test environments.' },
      { icon: 'BookOpen', title: 'Comprehensive Reference Library', desc: 'Vast collection of official Cambridge practice manuals, medical journals, German grammar guides, and quiet reading desks.' },
      { icon: 'Users', title: 'Sound-Insulated Speaking Booths', desc: 'Dedicated individual booths allowing students to record, replay, and review mock speaking tests with zero external noise interference.' },
      { icon: 'Building', title: 'Smart Digital Classrooms', desc: 'Air-conditioned lecture spaces equipped with 4K interactive presentation touchscreens, surround sound, and ergonomic student seating.' },
      { icon: 'Coffee', title: 'Student Lounge & Collaboration Zone', desc: 'A vibrant cafeteria and open-air discussion deck where peer study circles, group revisions, and informal mentorship interactions happen.' },
      { icon: 'ShieldCheck', title: 'Official Test Registration Desk', desc: 'In-house authorized assistance for exam slot booking, passport verification, credential evaluation, and exam fee payments.' },
    ],
    show: { journal: true, gallery: true, achievements: true, campus: true, videos: true, cta: true },
  },

  journal: {
    tag: 'EDUZY Journal',
    title: 'Latest Updates & Articles',
    subtitle: 'News, career guidance and stories from the EDUZY campus.',
    readMoreLabel: 'Read article',
    backLabel: 'Back to blogs',
    perPage: 9,
  },

  contact: {
    pageTitle: 'Contact Us',
    infoTitle: 'Contact Information',
    infoText: 'Have questions about admissions, fees, classes, or placements? Our team is ready to help you choose the right path.',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email Address',
    hoursLabel: 'Opening Hours',
    locationLabel: 'Our Location',
    mapTitle: 'Find Us',
    form: {
      eyebrow: 'Get In Touch',
      title: 'Send Us a Message',
      text: 'Fill in your details and they will open in WhatsApp, ready to send to our team.',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Sandra Joseph',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+91 98765 43210',
      locationLabel: 'Location',
      locationPlaceholder: 'Choose location',
      locationsMenuTitle: 'Our Locations',
      locations: ['Thrissur', 'Palakkad', 'Kannur', 'Trivandrum', 'Calicut', 'Kochi', 'Idukki'],
      topicLabel: 'Topic',
      topicPlaceholder: 'Choose topic',
      topicsMenuTitle: 'Topics',
      topics: ['Admissions & Courses', 'Fees & Payments', 'Classes & Batches', 'Certificates', 'Placement Support', 'Other'],
      messageLabel: 'Message',
      messagePlaceholder: 'Tell us how we can help',
      submitLabel: 'Send on WhatsApp',
      whatsappIntro: 'Hello EDUZY, I would like to get in touch.',
      successTitle: 'Almost Done, {name}!',
      successText: 'Press send in WhatsApp to deliver your message to our team.',
      againLabel: 'Open WhatsApp Again',
      newLabel: 'New Message',
      errors: {
        name: 'Full name is required',
        phone: 'Phone number is required',
        phoneInvalid: 'Please enter a valid phone number',
        location: 'Please select a location',
        topic: 'Please select a topic',
        message: 'Please tell us how we can help',
      },
    },
    enquiry: {
      title: 'Need Help Choosing a Course?',
      subtitle: 'Leave your details and our academic advisor will connect with you.',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Sandra Joseph',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+91 98765 43210',
      courseLabel: 'Select Course',
      coursePlaceholder: '-- Choose a course --',
      submitLabel: 'Submit Enquiry',
      submittingLabel: 'Submitting...',
      successTitle: 'Thank You, {name}!',
      successText: 'Your enquiry for {course} has been received. We will call you shortly at {phone}.',
      anotherLabel: 'Submit Another Enquiry',
      directLabel: 'Or reach us directly',
      whatsappLabel: 'WhatsApp Us',
      callLabel: 'Call Now',
      whatsappMessage: 'Hello EDUZY, I would like to enquire about your courses',
    },
  },

  quickContact: {
    title: 'Connect With Us',
    subtitle: 'Choose your preferred channel to get in touch instantly.',
    channels: [
      { type: 'whatsapp', visible: true, name: 'WhatsApp', subtitle: 'Chat with our advisor' },
      { type: 'instagram', visible: true, name: 'Instagram', subtitle: 'Follow our updates' },
      { type: 'youtube', visible: true, name: 'YouTube', subtitle: 'Watch our videos' },
      { type: 'call', visible: true, name: 'Call Now', subtitle: 'Speak directly with us' },
    ],
    whatsappMessage: 'Hello EDUZY, I want to enquire about admissions',
    comingSoonBanner: '🎬 YouTube Channel Coming Soon!',
    comingSoonText: '✨ Launching Soon! Stay tuned',
    comingSoonPill: 'Coming Soon',
    showFloating: true,
    connectTooltip: 'Connect With Us',
    callTooltip: 'Call Now: {phone}',
  },
};

// ---------------------------------------------------------------------------
// Collection seeds
// ---------------------------------------------------------------------------

export interface SeedItem {
  id: string;
  data: Record<string, any>;
  enabled?: boolean;
}

const strip = <T extends Record<string, any>>(o: T, keys: string[]) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) if (!keys.includes(k)) out[k] = v;
  return out;
};

export const COLLECTION_SEEDS: Record<string, () => SeedItem[]> = {
  courseCategories: () =>
    (seedCourseCategories as any[])
      .filter((c) => c.id !== 'all')
      .map((c) => ({ id: `cat-${c.id}`, data: { label: c.label, slug: c.id } })),

  courses: () =>
    (seedCourses as any[]).map((c) => ({
      id: `course-${c.id}`,
      data: {
        ...strip(c, ['id', 'orderNum', 'fullName', 'isUnderDesigningCategory']),
        aliases: c.aliases || [],
        categories: (c.categories || []).filter((x: string) => x !== c.category),
        imagePosition: c.imagePosition || '',
        gallery: [],
        featured: false,
        seo: {},
      },
    })),

  testimonials: () =>
    (seedTestimonials as any[]).map((t) => ({
      id: `testimonial-${t.id}`,
      data: { ...strip(t, ['id', 'color']), image: '', videoUrl: '' },
    })),

  videoTestimonials: () =>
    (seedVideoTestimonials as any[]).map((v) => ({ id: `video-${v.id}`, data: strip(v, ['id']) })),

  faqs: () => (seedFaqs as any[]).map((q) => ({ id: `faq-${q.id}`, data: { question: q.question, answer: q.answer } })),

  accreditations: () => [
    { id: 'acc-iqa-usa', data: { group: 'primary', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040617/eduzy/accreditation/badge1.png', name: 'IQA - International Qualifications and Assessments USA' } },
    { id: 'acc-sted-council', data: { group: 'primary', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040619/eduzy/accreditation/badge2.png', name: 'STED Council - Scientific and Technical Education Development Council' } },
    { id: 'acc-aaa-accreditation', data: { group: 'primary', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040621/eduzy/accreditation/badge3.png', name: 'Accreditation AAA - Organizational Member' } },
    { id: 'acc-american-board', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040623/eduzy/accreditation/american-board-of-education-seal.png', name: 'American Board of Education' } },
    { id: 'acc-nsdc-india', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040625/eduzy/accreditation/nsdc-logo-with-celebrating-figures.png', name: 'NSDC - National Skill Development Corporation' } },
    { id: 'acc-ignet-network', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040626/eduzy/accreditation/ignet-university-emblem-and-wordmark-removebg-preview.png', name: 'IGNET - Indira Gandhi National Open University' } },
    { id: 'acc-iso-9001', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040628/eduzy/accreditation/blue-iso-globe-logo.png', name: 'ISO 9001:2015 Certified' } },
    { id: 'acc-sap-erp', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040630/eduzy/accreditation/sap-blue-gradient-logo.png', name: 'SAP Enterprise ERP Solutions' } },
    { id: 'acc-microsoft-excel', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040632/eduzy/accreditation/microsoft-excel-logo-on-transparency.png', name: 'Microsoft Excel' } },
    { id: 'acc-tally-prime', data: { group: 'partner', image: 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040633/eduzy/accreditation/tally-black-and-red-script-logo-removebg-preview.png', name: 'Tally - Power of Simplicity' } },
  ],

  galleryCategories: () => [
    { id: 'gcat-classes', data: { label: 'Classes', badgeLabel: 'Classes', slug: 'classes' } },
    { id: 'gcat-events', data: { label: 'Events', badgeLabel: 'Events', slug: 'events' } },
    { id: 'gcat-industrial-visits', data: { label: 'Industrial Visits', badgeLabel: 'Industrial Visits', slug: 'industrial-visits' } },
    { id: 'gcat-student-activities', data: { label: 'Student Activities', badgeLabel: 'Student Activities', slug: 'student-activities' } },
    { id: 'gcat-achievements', data: { label: 'Achievements', badgeLabel: 'Achievements', slug: 'achievements' } },
    { id: 'gcat-campus', data: { label: 'Campus', badgeLabel: 'Campus & Facilities', slug: 'campus' } },
  ],

  gallery: () =>
    [
      ['CBT / Computer Lab', 'campus', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040634/eduzy/gallery/01-cbt-computer-lab.jpg', 'EDUZY students practising in the computer lab'],
      ['Annual Convocation Ceremony', 'events', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040635/eduzy/gallery/02-annual-convocation-ceremony.jpg', 'EDUZY convocation ceremony – Our Proud Graduates'],
      ['Classroom Sessions', 'classes', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040636/eduzy/gallery/03-classroom-sessions.jpg', 'Students attending a classroom session at EDUZY'],
      ['Industrial Visit – Port / Container Yard', 'industrial-visits', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040637/eduzy/gallery/04-industrial-visit-port-container-yard.jpg', 'EDUZY students in safety gear during a container yard visit'],
      ['Site Visit & Field Training', 'industrial-visits', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040638/eduzy/gallery/05-site-visit-field-training.jpg', 'EDUZY students in helmets and safety vests on a site visit'],
      ['Corporate Visit / Placement Drive', 'achievements', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040639/eduzy/gallery/06-corporate-visit-placement-drive.jpg', 'EDUZY students at a corporate office during a placement drive'],
      ['Student Trip & Outing', 'student-activities', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040640/eduzy/gallery/07-student-trip-outing.jpg', 'EDUZY students on a group trip'],
      ['Cultural Events & Celebrations', 'events', 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040641/eduzy/gallery/08-cultural-events-celebrations.jpg', 'Collage of EDUZY students celebrating cultural events and festivals'],
    ].map(([title, category, file, alt], i) => ({
      id: `photo-${i + 1}`,
      data: { title, category, image: file, alt, description: '' },
    })),

  blogCategories: () => [
    { id: 'bcat-campus-news', data: { label: 'Campus News', slug: 'campus-news' } },
    { id: 'bcat-career-guidance', data: { label: 'Career Guidance', slug: 'career-guidance' } },
    { id: 'bcat-student-stories', data: { label: 'Student Stories', slug: 'student-stories' } },
  ],

  blogs: () => [],
};
