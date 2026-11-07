import Home from '../../views/Home';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('home', '/');

export default function Page() {
  return <Home />;
}
