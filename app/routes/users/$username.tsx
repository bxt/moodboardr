import { Link, Outlet, json, useLoaderData } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { db } from '~/utils/db.server';

type UsersIdData = {
  user: {
    username: string;
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
    select: { username: true, _count: { select: { colorNames: true } } },
    where: { username },
  });

  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }

  const data: UsersIdData = {
    user,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function UsersId() {
  const { user } = useLoaderData<UsersIdData>();
  return (
    <>
      <p>
        <Link to="..">back</Link>
      </p>
      <h1>The space of {user.username}</h1>
      <p>They collected a bunch of inspiration:</p>
      <ul>
        <li>
          <Link to="colors">{user._count.colorNames} colors</Link>
        </li>
        <Outlet />
      </ul>
    </>
  );
}

export const meta: MetaFunction = ({ data }: { data: UsersIdData }) => {
  return {
    title: data ? `${data.user.username} on moodboardr` : 'Oops...',
  };
};
