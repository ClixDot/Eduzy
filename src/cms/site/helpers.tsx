import React from 'react';
import {
  Briefcase, Target, Users, Award, Monitor, BookOpen, Building, Building2, Coffee, ShieldCheck, Star, CircleCheckBig, MapPin,
  Clock, Compass, GraduationCap, Globe, Heart, Lightbulb, Rocket, Sparkles, Trophy, Laptop, Plane, Stethoscope, Palette,
  Calculator, Truck, Megaphone, Medal, BadgeCheck, type LucideProps,
} from 'lucide-react';

/** Only the icons offered in the CMS are bundled (keeps the public site small). */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Briefcase, Target, Users, Award, Monitor, BookOpen, Building, Building2, Coffee, ShieldCheck, Star, CircleCheckBig, MapPin,
  Clock, Compass, GraduationCap, Globe, Heart, Lightbulb, Rocket, Sparkles, Trophy, Laptop, Plane, Stethoscope, Palette,
  Calculator, Truck, Megaphone, Medal, BadgeCheck,
};

export const tel = (phone: string) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;
export const whatsapp = (number: string, message?: string) =>
  `https://wa.me/${String(number || '').replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** Replaces {name}-style placeholders. */
export const fill = (template: string, vars: Record<string, string>) =>
  String(template || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

export const isExternal = (url: string) => /^https?:\/\//i.test(url || '');

export function CmsIcon({ name, fallback = 'Sparkles', ...props }: { name?: string; fallback?: string } & LucideProps) {
  const Cmp = (name && ICONS[name]) || ICONS[fallback];
  return Cmp ? <Cmp {...props} /> : null;
}

/** Heading text that is followed by orange words: guarantees exactly one space between them. */
export const spaced = (start?: string) => (start ? `${start.replace(/\s+$/, '')} ` : '');
