# EDUZY Website

Public website for [eduzycampus.com](https://eduzycampus.com) with a built-in content management dashboard.

* **Framework:** Next.js 16 (App Router), React 19, TypeScript
* **Admin dashboard:** `/admin` — manage pages, courses, blog posts, gallery, testimonials, images, settings and SEO
* **Storage:** MongoDB (content) and Cloudinary (images) in production; local files in development

```bash
npm install
cp .env.example .env.local   # set CMS_SESSION_SECRET
npm run dev                  # http://localhost:3000 and http://localhost:3000/admin
```

See **[docs/CMS.md](docs/CMS.md)** for what is editable, how the CMS works, and deployment instructions.
