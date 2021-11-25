import { Link, Outlet, json, useLoaderData } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { prisma } from '~/utils/db.server';
import { NavLinkWithActive } from '~/components/NavLinkWithActive';

type UsersIdData = {
  user: {
    username: string;
    _count: {
      colorNames: number;
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
      _count: { select: { colorNames: true, boards: true } },
    },
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

      <nav aria-label="User navigation" className="moodboardr__nav">
        <ul>
          <li>
            <NavLinkWithActive to="boards">
              {user._count.boards} boards
            </NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="colors">
              {user._count.colorNames} colors
            </NavLinkWithActive>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export const meta: MetaFunction = ({ data }: { data: UsersIdData }) => {
  return {
    title: data ? `${data.user.username} on moodboardr` : 'Oops...',
  };
};
