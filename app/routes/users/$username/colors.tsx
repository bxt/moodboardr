import type { LoaderFunction, MetaFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { prisma } from '~/utils/db.server';

type UsersIdColorsData = {
  user: {
    username: string;
    colorNames: {
      name: string;
      color: string;
    }[];
    _count: {
      colorNames: number;
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
      _count: { select: { colorNames: true } },
      colorNames: {
        select: { name: true, color: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    where: { username },
  });

  if (!user) {
    throw new Response('User does not exist.', { status: 404 });
  }

  const data: UsersIdColorsData = {
    user,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function UsersIdColors() {
  const {
    user: { username, colorNames, _count },
  } = useLoaderData<UsersIdColorsData>();

  return (
    <div>
      <p>
        Most recent of the {_count.colorNames} colors of {username}:
      </p>
      <ul className="moodboardr__colorlist">
        {colorNames.map(({ name, color }) => (
          <li key={color}>
            <Link to={`/colors/${color}`}>
              <span
                className="moodboardr__colorlist-preview"
                style={{ backgroundColor: `#${color}` }}
              />
              <span className="moodboardr__colorlist-hex">
                {'#'}
                {color}
              </span>
              <span className="moodboardr__colorlist-name">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const meta: MetaFunction = ({ data }: { data: UsersIdColorsData }) => {
  return {
    title: data ? `${data.user.username}'s colors on moodboardr` : 'Oops...',
  };
};
