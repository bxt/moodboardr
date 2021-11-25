import type { LoaderFunction, MetaFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { db } from '~/utils/db.server';

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

  const user = await db.user.findFirst({
    select: {
      username: true,
      _count: { select: { colorNames: true } },
      colorNames: { select: { name: true, color: true } },
    },
    where: { username },
  });

  if (!user) {
    throw new Response('Not Found', { status: 404 });
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
      <ul>
        {colorNames.map(({ name, color }) => (
          <li key={color}>
            <Link to={`/colors/${color}`}>
              <i style={{ color: `#${color}` }}>#{color}</i> aka {name}
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
