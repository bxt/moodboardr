import { json, useLoaderData, Link } from 'remix';
import type { LoaderFunction } from 'remix';
import { prisma } from '~/utils/db.server';
import { requireColor } from '~/utils/colors';

type ColorsIdIndexData = {
  color: string;
  colorNames: {
    name: string;
    glossarist: {
      username: string;
    };
  }[];
};

export const loader: LoaderFunction = async ({ params }) => {
  const color = requireColor(params);

  const data: ColorsIdIndexData = {
    color,
    colorNames: await prisma.colorName.findMany({
      take: 10,
      select: { name: true, glossarist: { select: { username: true } } },
      where: { color },
      orderBy: { createdAt: 'desc' },
    }),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function ColorsIdIndex() {
  const { colorNames } = useLoaderData<ColorsIdIndexData>();
  return (
    <>
      {colorNames.length === 0 ? (
        <p>
          This color was not named yet. Be the first to{' '}
          <Link to="collect">collect</Link>!
        </p>
      ) : (
        <>
          <p>It&apos;s known by those names:</p>
          <ul>
            {colorNames.map(({ name, glossarist: { username } }) => (
              <li key={username}>
                {name} by {username}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
