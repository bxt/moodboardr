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
    colors: {
      color: string;
      relativeSize: number;
    }[];
  }[];
};

export const loader: LoaderFunction = async () => {
  const recentlyCreatedBoards = await prisma.board.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      artDirector: { select: { username: true } },
      colors: { select: { color: true, relativeSize: true } },
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
      <p>
        Would you like to <Link to="add">add a board</Link>?
      </p>
      <p>Here are some recently created boards:</p>
      <ul className="moodboardr__boardlist">
        {recentlyCreatedBoards.map(
          ({ id, name, artDirector: { username }, colors }) => (
            <li key={id}>
              <div className="moodboardr__board-preview">
                {colors.map(({ color, relativeSize }, index) => (
                  <div
                    key={index}
                    className="moodboardr__board-element"
                    style={{
                      backgroundColor: `#${color}`,
                      flexGrow: relativeSize,
                    }}
                  />
                ))}
              </div>
              <div>
                <Link to={id}>{name}</Link>
                <br />
                by <Link to={`/users/${username}`}>{username}</Link>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
