import type { LoaderFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { prisma } from '~/utils/db.server';

type UsersIndexData = {
  users: {
    username: string;
  }[];
};

export const loader: LoaderFunction = async () => {
  const data: UsersIndexData = {
    users: await prisma.user.findMany({
      take: 10,
      select: { username: true },
      orderBy: { createdAt: 'desc' },
    }),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function UsersIndex() {
  const { users } = useLoaderData<UsersIndexData>();

  return (
    <div>
      <p>Here are some recently registered users:</p>
      <ul>
        {users.map(({ username }) => (
          <li key={username}>
            <Link to={username}>{username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
