import type { LoaderFunction, MetaFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { prisma } from '~/utils/db.server';

type UsersIdBoardsData = {
  user: {
    username: string;
    boards: {
      name: string;
      id: string;
      colors: {
        color: string;
        relativeSize: number;
      }[];
    }[];
    _count: {
      boards: number;
    };
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const { username } = params;

  if (!username) {
    throw new Response('No username', { status: 400 });
  }

  const user = await prisma.user.findFirst({
    select: {
      username: true,
      _count: { select: { boards: true } },
      boards: {
        select: {
          name: true,
          id: true,
          colors: { select: { color: true, relativeSize: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    where: { username },
  });

  if (!user) {
    throw new Response('User does not exist.', { status: 404 });
  }

  const data: UsersIdBoardsData = {
    user,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function UsersIdColors() {
  const {
    user: { username, boards, _count },
  } = useLoaderData<UsersIdBoardsData>();

  return (
    <div>
      <p>
        Most recent of the {_count.boards} boards of {username}:
      </p>
      <ul className="moodboardr__boardlist">
        {boards.map(({ id, name, colors }) => (
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
              <Link to={`/boards/${id}`}>{name}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const meta: MetaFunction = ({ data }: { data: UsersIdBoardsData }) => {
  return {
    title: data ? `${data.user.username}'s boards on moodboardr` : 'Oops...',
  };
};
