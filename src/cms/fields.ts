/**
 * Field definitions shared by the admin forms (client) and the API validation (server).
 * One definition per piece of content = one source of truth.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext' // full article editor (headings, lists, links, images)
  | 'inline' // short formatted text (bold, italic, links only)
  | 'url'
  | 'email'
  | 'tel'
  | 'number'
  | 'color'
  | 'date'
  | 'slug'
  | 'image'
  | 'images'
  | 'toggle'
  | 'select'
  | 'multiselect'
  | 'stringList'
  | 'repeater'
  | 'group'
  | 'icon'
  | 'font';

export type OptionsSource = 'courseCategories' | 'galleryCategories' | 'blogCategories';

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  required?: boolean;
  /** max characters (text) or max value (number) */
  max?: number;
  min?: number;
  rows?: number;
  options?: FieldOption[];
  optionsFrom?: OptionsSource;
  /** nested fields for `repeater` and `group` */
  fields?: Field[];
  itemLabel?: string;
  titleField?: string;
  maxItems?: number;
  minItems?: number;
  /** layout hint for the admin form */
  half?: boolean;
  /** editor tab this field belongs to */
  tab?: string;
  /** hide unless another field (same level) is truthy */
  showIf?: string;
}

export const f = {
  text: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'text', max: 300, ...o }),
  area: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'textarea', rows: 3, max: 4000, ...o }),
  inline: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'inline', max: 6000, ...o }),
  rich: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'richtext', max: 200000, ...o }),
  url: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'url', max: 2000, ...o }),
  image: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'image', ...o }),
  toggle: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'toggle', ...o }),
  num: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'number', ...o }),
  list: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'stringList', max: 600, ...o }),
  icon: (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: 'icon', ...o }),
  select: (name: string, label: string, options: FieldOption[], o: Partial<Field> = {}): Field => ({ name, label, type: 'select', options, ...o }),
  repeater: (name: string, label: string, fields: Field[], o: Partial<Field> = {}): Field => ({ name, label, type: 'repeater', fields, ...o }),
  group: (name: string, label: string, fields: Field[], o: Partial<Field> = {}): Field => ({ name, label, type: 'group', fields, ...o }),
};

/** A link button: label + destination. */
export const buttonFields = (urlHelp?: string): Field[] => [
  f.text('label', 'Button text', { max: 60, half: true }),
  f.url('url', 'Button link', { half: true, help: urlHelp }),
];

/** SEO fields used for pages and for individual courses / blog posts. */
export const seoFields: Field[] = [
  f.text('title', 'SEO title', { max: 120, help: 'Shown in Google results and the browser tab. Aim for 50–60 characters.' }),
  f.area('description', 'Meta description', { max: 320, help: 'Summary shown under the title in Google. Aim for 120–160 characters.' }),
  f.text('keywords', 'Keywords', { max: 500, help: 'Optional. Comma separated.' }),
  f.url('canonical', 'Canonical URL', { help: 'Leave empty to use this page’s own address.' }),
  f.text('ogTitle', 'Social share title', { max: 120, help: 'Title used when the page is shared on WhatsApp, Facebook, LinkedIn. Leave empty to reuse the SEO title.' }),
  f.area('ogDescription', 'Social share description', { max: 320 }),
  f.image('ogImage', 'Social share image', { help: 'Recommended 1200 × 630 px.' }),
  f.text('ogImageAlt', 'Social share image description (alt text)', { max: 200 }),
  f.toggle('noindex', 'Hide this page from search engines'),
];

export const ICON_OPTIONS = [
  'Briefcase', 'Target', 'Users', 'Award', 'Monitor', 'BookOpen', 'Building', 'Building2', 'Coffee', 'ShieldCheck',
  'Star', 'CircleCheckBig', 'MapPin', 'Clock', 'Compass', 'GraduationCap', 'Globe', 'Heart', 'Lightbulb', 'Rocket',
  'Sparkles', 'Trophy', 'Laptop', 'Plane', 'Stethoscope', 'Palette', 'Calculator', 'Truck', 'Megaphone', 'Medal', 'BadgeCheck',
] as const;

export const FONT_OPTIONS: FieldOption[] = [
  { value: 'Inter', label: 'Inter (EDUZY body font)' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (EDUZY heading font)' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Montserrat', label: 'Montserrat' },
];
