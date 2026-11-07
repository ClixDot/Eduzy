import { Suspense } from 'react';
import Courses from '../../../views/Courses';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('courses', '/courses');

export default function CoursesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Courses />
    </Suspense>
  );
}
