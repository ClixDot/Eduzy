import { SimpleSingletonPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "Courses page" };

export default function Page() {
  return <SimpleSingletonPage docKey="coursesPage" title="Courses page & course details" sub="Heading of the Courses page, its enquiry box, and the labels shown on every course detail page." />;
}
