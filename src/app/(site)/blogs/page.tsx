import Portfolio from '../../../views/Portfolio';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('blogs', '/blogs');

export default function BlogsPage() {
  return <Portfolio />;
}
