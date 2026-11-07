import QuickContact from '../../../views/QuickContact';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('quickContact', '/quick-contact');

export default function QuickContactPage() {
  return <QuickContact />;
}
