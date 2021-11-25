import type { LoaderFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { prisma } from '~/utils/db.server';

type BoardsIndexData = {
  recentlyCreatedBoards: {
    id: string;
    name: string;
    artDirector: {
      username: string;
    };
  }[];
};

export const loader: LoaderFunction = async () => {
  const recentlyCreatedBoards = await prisma.board.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      artDirector: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data: BoardsIndexData = {
    recentlyCreatedBoards,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function BoardsIndex() {
  const { recentlyCreatedBoards } = useLoaderData<BoardsIndexData>();

  return (
    <div>
      <h1>Boards</h1>
      <p>Here are some recently created boards:</p>
      <ul>
        {recentlyCreatedBoards.map(
          ({ id, name, artDirector: { username } }) => (
            <li key={id}>
              <Link to={id}>{name}</Link> by{' '}
              <Link to={`/users/${username}`}>{username}</Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
