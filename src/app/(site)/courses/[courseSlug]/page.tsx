import { redirect } from 'next/navigation';
import CourseDetails from '../../../../views/CourseDetails';
import { listItems } from '@/cms/server/content';
import { buildMetadata, getCourse } from '@/cms/site/server';

type Props = { params: Promise<{ courseSlug: string }> };

export async function generateStaticParams() {
  const items = await listItems('courses');
  return items.filter((c) => c.published).map((c) => ({ courseSlug: c.published!.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) return { title: 'Course Details | EDUZY' };
  const seo = course.seo || {};
  return buildMetadata(
    {
      ...seo,
      title: seo.title || `${course.name} | EDUZY`,
      description: seo.description || course.overview || course.shortDesc || `Learn ${course.name} at EDUZY Campus to Career with practical training and international certifications.`,
      ogImage: seo.ogImage || course.image,
      ogImageAlt: seo.ogImageAlt || course.imageAlt,
    },
    `/courses/${course.slug}`,
  );
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  // Unknown course: same behaviour as before (back to the course list). Temporary redirect,
  // so a course created later under this address is not hidden by a cached redirect.
  if (!course) redirect('/courses');
  return <CourseDetails courseId={course.id} />;
}
