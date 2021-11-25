import type { MetaFunction, LinksFunction } from 'remix';
import { Outlet } from 'remix';
import boardsStylesUrl from '~/styles/boards.css';

export const meta: MetaFunction = () => {
  return { title: 'Boards on moodboardr' };
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: boardsStylesUrl }];
};

export default function BoardsIndex() {
  return <Outlet />;
}
