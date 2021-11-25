import type { MetaFunction } from 'remix';
import { Outlet } from 'remix';

export const meta: MetaFunction = () => {
  return { title: 'Colors on moodboardr' };
};

export default function ColorsIndex() {
  return <Outlet />;
}
