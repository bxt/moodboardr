import type { MetaFunction, LinksFunction } from 'remix';
import { Outlet } from 'remix';
import colorsStylesUrl from '~/styles/colors.css';

export const meta: MetaFunction = () => {
  return { title: 'Colors on moodboardr' };
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: colorsStylesUrl }];
};

export default function ColorsIndex() {
  return <Outlet />;
}
