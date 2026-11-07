import {
  LayoutDashboard, PanelsTopLeft, House, Info, GraduationCap, FolderTree, Newspaper, Images, Quote, Trophy, BadgeCheck,
  CircleHelp, Mail, PanelBottom, Library, Settings, SearchCheck, UserRound, LogOut, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** extra path prefixes that mark this item active */
  match?: string[];
  permission?: 'settings' | 'users';
  action?: 'logout';
}

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Website CMS', href: '/admin/website', icon: PanelsTopLeft, match: ['/admin/pages/courses', '/admin/pages/quick-contact'] },
    ],
  },
  {
    group: 'Pages',
    items: [
      { label: 'Home Page', href: '/admin/pages/home', icon: House },
      { label: 'About Page', href: '/admin/pages/about', icon: Info },
      { label: 'Portfolio / Blogs Page', href: '/admin/pages/portfolio', icon: Images },
      { label: 'Contact Page', href: '/admin/contact', icon: Mail },
      { label: 'Footer', href: '/admin/footer', icon: PanelBottom },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
      { label: 'Course Categories', href: '/admin/course-categories', icon: FolderTree },
      { label: 'Blogs / Journal', href: '/admin/blogs', icon: Newspaper },
      { label: 'Gallery', href: '/admin/gallery', icon: Images },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
      { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
      { label: 'Accreditation', href: '/admin/accreditation', icon: BadgeCheck },
      { label: 'FAQ', href: '/admin/faq', icon: CircleHelp },
    ],
  },
  {
    group: 'Library & settings',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: Library },
      { label: 'Global Settings', href: '/admin/settings', icon: Settings, permission: 'settings' },
      { label: 'SEO Settings', href: '/admin/seo', icon: SearchCheck, permission: 'settings' },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'Admin Profile', href: '/admin/profile', icon: UserRound },
      { label: 'Logout', href: '#logout', icon: LogOut, action: 'logout' },
    ],
  },
];

/** Breadcrumb labels for path segments. */
export const CRUMB_LABELS: Record<string, string> = {
  admin: 'Dashboard', website: 'Website CMS', pages: 'Pages', home: 'Home Page', about: 'About Page', courses: 'Courses',
  portfolio: 'Portfolio / Blogs page', 'quick-contact': 'Quick contact', contact: 'Contact Page', header: 'Header & Navigation',
  footer: 'Footer', 'course-categories': 'Course Categories', blogs: 'Blogs / Journal', gallery: 'Gallery', testimonials: 'Testimonials',
  achievements: 'Achievements', accreditation: 'Accreditation', faq: 'FAQ', media: 'Media Library', settings: 'Global Settings',
  seo: 'SEO Settings', profile: 'Admin Profile', new: 'New', hero: 'Hero', whyChoose: 'Why Choose EDUZY', director: 'Founder Message',
  cta: 'Call to Action', featuredCourses: 'Featured Courses',
};
