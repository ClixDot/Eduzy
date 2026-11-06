import { Suspense } from 'react';
import Courses from '../../views/Courses';

export const metadata = {
  title: 'AI-Integrated International Diploma Courses | EDUZY',
  description: 'Explore industry-certified international diploma programs at EDUZY in Logistics, Accounting, Digital Marketing, Fashion & Interior Designing, Hospital Administration, and Aviation.',
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Courses />
    </Suspense>
  );
}
