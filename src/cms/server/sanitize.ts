import 'server-only';
import sanitizeHtml from 'sanitize-html';

const common: sanitizeHtml.IOptions = {
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  transformTags: {
    b: 'strong',
    i: 'em',
    a: (tagName, attribs) => {
      const out: Record<string, string> = { href: attribs.href || '#' };
      if (attribs.target === '_blank') {
        out.target = '_blank';
        out.rel = 'noopener noreferrer';
      }
      return { tagName, attribs: out };
    },
  },
};

const inline: sanitizeHtml.IOptions = {
  ...common,
  allowedTags: ['strong', 'em', 'a', 'br', 'u'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
};

const rich: sanitizeHtml.IOptions = {
  ...common,
  allowedTags: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre'],
  allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'] },
};

export function cleanHtml(html: string, mode: 'inline' | 'rich'): string {
  if (!html) return '';
  const out = sanitizeHtml(html, mode === 'inline' ? inline : rich).trim();
  // editors often leave a lone <br> or empty paragraph behind
  return out === '<br />' || out === '<p></p>' || out === '<p><br /></p>' ? '' : out;
}
