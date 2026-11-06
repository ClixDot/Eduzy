import CourseDetails from '../../../views/CourseDetails';
import { courses } from '../../../data/courses';

export function generateStaticParams() {
  return courses.map((course) => ({
    courseSlug: course.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { courseSlug } = await params;
  const course = courses.find(
    (c) =>
      c.slug.toLowerCase() === courseSlug?.toLowerCase() ||
      (Array.isArray(c.aliases) && c.aliases.map((a) => a.toLowerCase()).includes(courseSlug?.toLowerCase()))
  );

  if (!course) {
    return {
      title: 'Course Details | EDUZY',
    };
  }

  return {
    title: `${course.name} | EDUZY`,
    description: course.overview || course.shortDesc || `Learn ${course.name} at EDUZY Campus to Career with practical training and international certifications.`,
    openGraph: {
      title: `${course.name} | EDUZY`,
      description: course.overview || course.shortDesc,
      images: course.image ? [{ url: `https://eduzycampus.com${course.image}` }] : [],
    },
  };
}

export default function CoursePage() {
  return <CourseDetails />;
}
