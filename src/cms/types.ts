export type Role = 'owner' | 'editor';

export interface SingletonDoc {
  id: string;
  draft: any;
  published: any | null;
  version: number;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string | null;
  publishedBy?: string;
}

export interface ItemDoc {
  id: string;
  order: number;
  draft: Record<string, any>;
  /** snapshot visible on the public website; null = not published */
  published: Record<string, any> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string | null;
}

export interface MediaDoc {
  id: string;
  url: string;
  provider: 'static' | 'local' | 'cloudinary';
  /** storage key: local file name or Cloudinary public_id */
  storageKey?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt: string;
  folder: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
}

export interface UserDoc {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  sessionVersion: number;
  createdAt: string;
  lastLoginAt?: string | null;
  resetTokenHash?: string | null;
  resetExpires?: number | null;
  disabled?: boolean;
  onboarding?: OnboardingState;
}

/** Per-admin guided-tour progress (stored on the user record, so it follows the account). */
export interface OnboardingState {
  started: boolean;
  completed: boolean;
  skipped: boolean;
  /** index of the last tour step the admin reached */
  lastStep: number;
  /** show the welcome screen again on the next visit */
  showAgain: boolean;
  /** show the welcome screen after every sign-in (default on) */
  showOnLogin?: boolean;
  updatedAt: string;
}

export interface ActivityDoc {
  id: string;
  at: string;
  userId?: string;
  userName?: string;
  action: 'created' | 'saved' | 'published' | 'unpublished' | 'deleted' | 'duplicated' | 'reordered' | 'uploaded' | 'replaced' | 'discarded' | 'signed-in' | 'imported' | 'updated';
  kind: 'page' | 'section' | 'item' | 'media' | 'user' | 'system';
  target: string;
  label: string;
  href?: string;
}

export type PublicUser = Omit<UserDoc, 'passwordHash' | 'resetTokenHash' | 'resetExpires' | 'sessionVersion' | 'onboarding'> & { onboarding: OnboardingState | null };

export const toPublicUser = (u: UserDoc): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt ?? null,
  disabled: !!u.disabled,
  onboarding: u.onboarding ?? null,
});
