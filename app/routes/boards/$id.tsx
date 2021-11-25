import { Link, json, useLoaderData, Outlet } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { NavLinkWithActive } from '~/components/NavLinkWithActive';
import { prisma } from '~/utils/db.server';

type BoardsIdData = {
  board: {
    name: string;
    intro: string;
    createdAt: string;
    artDirector: {
      username: string;
    };
    colors: {
      color: string;
      relativeSize: number;
    }[];
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.id) throw new Response('Not Found', { status: 404 });

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      intro: true,
      createdAt: true,
      artDirector: {
        select: { username: true },
      },
      colors: {
        select: {
          color: true,
          relativeSize: true,
        },
      },
    },
  });

  if (!board) throw new Response('Not Found', { status: 404 });

  const data: BoardsIdData = {
    board: { ...board, createdAt: board.createdAt.toISOString() },
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function BoardsId() {
  const {
    board: {
      name,
      createdAt,
      artDirector: { username },
      colors,
    },
  } = useLoaderData<BoardsIdData>();
  return (
    <>
      <h1>
        <Link to="..">Boards</Link> &raquo; #{name}
      </h1>
      <p>
        Created by <Link to={`/users/${username}`}>{username}</Link> at{' '}
        {createdAt.substr(0, 10)}
      </p>
      <div className="moodboardr__board-preview">
        {colors.map(({ color, relativeSize }, index) => (
          <div
            key={index}
            className="moodboardr__board-element"
            style={{ backgroundColor: `#${color}`, flexGrow: relativeSize }}
          />
        ))}
      </div>
      <nav aria-label="Board navigation" className="moodboardr__nav">
        <ul>
          <li>
            <NavLinkWithActive to="." end>
              Intro
            </NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="colors" end>
              Colors
            </NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="edit">Edit</NavLinkWithActive>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export const meta: MetaFunction = ({ data }: { data: BoardsIdData | null }) => {
  return {
    title: data ? `Board #${data.board.name} on moodboardr` : 'Oops...',
  };
};
