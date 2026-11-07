# EDUZY Website CMS

The admin dashboard at **`/admin`** manages all content of the public website (eduzycampus.com) without code changes.
This document covers what is editable, how the system works, and how to deploy it.

---

## 1. What can be edited (page-by-page mapping)

Every public page reads its content from the CMS. Defaults are the website's original content, so nothing changes on
the live site until an admin publishes an edit.

| Public page / area | Where it is edited in the admin |
| --- | --- |
| **Home** (`/`) – section order, show/hide, custom text blocks | Home Page |
| Hero (headline, orange words, description, buttons, founder portrait, mobile image, background, rotating text, founder card) | Home Page → Hero |
| Statistics counters (15+, 40,000+ …) | Achievements → Statistics counters |
| Why Choose EDUZY (badge, heading, paragraphs, 4 feature cards with icons/bullets, orange banner) | Home Page → Why Choose EDUZY |
| Accreditation logos (top row + partners) and section text | Accreditation |
| Featured courses (optional section, off by default) | Home Page → Featured Courses |
| Director / founder message (portrait, name, designation, message, signature) | Home Page → Founder message |
| Video stories carousel + heading | Testimonials → Video stories / Videos heading |
| Student testimonials + heading | Testimonials → Written reviews / Reviews heading |
| FAQ + heading | FAQ |
| Call to action (orange card; also on courses, course detail, portfolio, about) | Home Page → Call to Action |
| **Courses** (`/courses`) – heading, filter labels, enquiry box | Website CMS → Courses page & details |
| Course list, every course page (`/courses/<slug>`), categories, SEO | Courses, Course Categories |
| Course detail labels (What you will learn, learning modes, WhatsApp text …) | Courses page & details → Course detail pages |
| **Portfolio / Blogs** (`/portfolio`, `/blogs`) – hero, jump links, gallery text, facilities, section toggles | Website CMS → Portfolio / Blogs page |
| Photo gallery + categories | Gallery |
| Student achievements (placement highlights) | Achievements → Student achievements |
| **Blog posts** (new: list on `/blogs`, pages at `/blogs/<slug>`) | Blogs / Journal |
| **Contact** (`/contact`) – page text, contact form labels/messages, locations, topics | Contact Page → Page text & forms |
| Phone, WhatsApp, email, address, hours, Google Map, social links (used site-wide) | Contact Page → Contact details (or Global Settings) |
| Course enquiry form (courses pages) | Contact Page → Course enquiry form |
| **Quick contact** (`/quick-contact`), chat popup, floating call/chat buttons | Website CMS → Quick contact & floating buttons |
| **About** (`/about`) – heading, mission, vision, core values, shared sections | About Page (off by default → `/about` keeps redirecting to `/portfolio`) |
| Header – logo, menu links, Enroll button, mobile call button | Header & Navigation |
| Footer – logo, description, links, programmes, contact block, CTA strip, copyright, legal links | Footer |
| Site name, logo, favicon, brand colours, fonts, announcement bar, popup, maintenance mode | Global Settings |
| SEO for every page (title, description, canonical, social share image, noindex) | SEO Settings (courses & posts: on each item) |
| All images | Media Library (upload, alt text, replace everywhere, delete unused) |

Not managed (unchanged code): `views/WhyChooseUs.tsx` and `components/LearningJourney.tsx`, which are not reachable
(`/why-choose-us` redirects to `/portfolio`).

---

## 2. How it works

### Folders

```
src/
  cms/                     shared CMS core (no UI)
    fields.ts              field types used by forms + validation
    schema.ts              the content model: every section (singleton) and list (collection)
    defaults.ts            original website content = seed + fallback
    validate.ts            validation used by both the browser and the server
    server/                server-only code
      store/               storage adapters: file.ts (development) and mongo.ts (production)
      content.ts           draft/publish, collections, activity log, public content
      auth.ts session.ts   admins, password hashing (scrypt), signed session cookies, roles
      media.ts             media library + storage adapters: local (development) and Cloudinary
      sanitize.ts          HTML sanitising for formatted text
      http.ts mail.ts      API helpers, password-reset email (Resend)
    site/                  public-site integration (ContentProvider, metadata helpers)
  admin/                   admin dashboard UI (client components, own stylesheet admin.css)
  app/(site)/              public pages (same URLs as before)
  app/admin/               admin pages; (auth) = sign-in screens, (panel) = protected area
  app/api/admin/           admin JSON API
  proxy.ts                 redirects unauthenticated visitors away from /admin
```

### Content model

* **Singletons** — one document per page/section (`hero`, `footer`, `settings` …).
* **Collections** — ordered lists (`courses`, `blogs`, `gallery`, `testimonials`, `faqs`, `accreditations` …).
* Every document keeps a **draft** and a **published** copy. *Save draft* changes only the draft; *Publish* copies it
  to the live version. Collection items can also be unpublished (hidden), duplicated, reordered and deleted.
* Saves use optimistic locking (`version`), so two admins cannot silently overwrite each other.
* All input is validated on the server with the same field definitions the forms use. Links are restricted to
  `https://`, site paths, `mailto:` and `tel:`; formatted text is sanitised.

### Public website synchronisation

* The `(site)` layout loads published content once per request and passes it to `ContentProvider`; existing
  components read it with `useSite()`. Markup, CSS and GSAP animations are unchanged.
* Pages stay statically generated. Publishing calls `revalidatePath('/', 'layout')`, so the next visit renders fresh
  content. A 5-minute time-based refresh (`revalidate = 300`) is a safety net if an on-demand refresh is ever missed
  (for example, a self-hosted server restarting).
* `sitemap.xml` and `robots.txt` are generated from published content.

### Live preview

Editors show the real public page in an iframe in Next.js **Draft Mode** (`/api/admin/preview`), which renders saved
drafts. Unsaved edits are streamed into the iframe with `postMessage`, so the preview updates while typing.
Visitors never see drafts.

### Security

* Passwords: scrypt with per-user salt. Sessions: HMAC-signed, httpOnly, SameSite=Lax cookies (12 h, or 30 days with
  “keep me signed in”); every API call re-checks the user in the database.
* Roles: **Owner** (everything) and **Editor** (content and media; no settings, SEO or admin management).
* Login rate limiting, CSRF protection (same-origin check on writes), `noindex` + `X-Frame-Options: DENY` on `/admin`.
* Uploads are checked by file signature (not just extension), limited to 10 MB, SVG uploads are refused.
* Secrets (`MONGODB_URI`, Cloudinary keys, session secret) are only read on the server.

---

## 3. Local development

```bash
npm install
cp .env.example .env.local      # set CMS_SESSION_SECRET (any 32+ random characters)
npm run dev
```

Open <http://localhost:3000/admin> → you are sent to **/admin/setup** to create the first owner account.

Without `MONGODB_URI` and Cloudinary variables, content is stored in `.cms-data/*.json` and uploads in
`.cms-data/uploads/` (both git-ignored). The admin shows “Development storage” notices while these adapters are used.
Delete `.cms-data/` to start over from the original website content.

---

## 4. Deployment (production)

1. **MongoDB** — create a database (e.g. MongoDB Atlas, M0 is enough), create a user, allow the hosting IPs, and copy
   the connection string.
2. **Cloudinary** — copy the `CLOUDINARY_URL` from the Cloudinary console (API Keys).
3. **Environment variables** on the host (see `.env.example`):

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `CMS_SESSION_SECRET` | yes | Signs admin sessions (32+ random characters) |
   | `CMS_SETUP_TOKEN` | yes, for first setup | Code needed to create the first owner at `/admin/setup`; remove afterwards |
   | `MONGODB_URI`, `MONGODB_DB` | yes | Content database |
   | `CLOUDINARY_URL` (or the 3 separate variables) | yes | Image storage |
   | `CLOUDINARY_FOLDER` | no | Root folder in Cloudinary (default `eduzy`) |
   | `RESEND_API_KEY`, `CMS_EMAIL_FROM` | recommended | Password-reset emails |

4. **Build & deploy** — `npm run build` (the build reads content from MongoDB; on first run it seeds the database with
   the current website content). On Vercel, push the repository and set the variables in Project Settings.
5. **Create the owner** — open `https://<domain>/admin/setup`, enter the setup code, create the account, then remove
   `CMS_SETUP_TOKEN`.
6. Check **Admin Profile → System status**: content and image storage should both show “Ready”.

> The local file adapters must not be used on serverless hosting (Vercel), because its filesystem is temporary.
> Images that ship with the website (`public/assets`) remain where they are; new uploads go to Cloudinary.

---

## 5. Known limitations

* The course enquiry form (`EnquiryForm`) shows a “received” message but does not send the enquiry anywhere — this is
  the original behaviour and is unchanged. The Contact page form does send via WhatsApp.
* Brand colour changes apply to everything that used the EDUZY orange as a solid colour; a few soft glows that used a
  semi-transparent orange keep the original tint.
* Fonts other than Inter / Plus Jakarta Sans are loaded from Google Fonts when selected.
* Without email configuration, password-reset links are printed in the server console (development) and owners can
  set passwords for other admins under **Admin Profile → Admins & roles**.
