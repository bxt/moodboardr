import type { MetaFunction } from 'remix';
import { Outlet } from 'remix';

export const meta: MetaFunction = () => {
  return { title: 'Users on moodboardr' };
};

export default function UsersIndex() {
  return <Outlet />;
}
