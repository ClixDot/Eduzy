import Portfolio from '../../../views/Portfolio';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('portfolio', '/portfolio');

export default function PortfolioPage() {
  return <Portfolio />;
}
