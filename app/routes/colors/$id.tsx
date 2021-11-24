import { Link, Form, json, useLoaderData } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { db } from '~/utils/db.server';

type ColorsIdData = {
  color: string;
  colorNames: {
    name: string;
    glossarist: {
      username: string;
    };
  }[];
};

export const loader: LoaderFunction = async ({ params }) => {
  // pretend like we're using params.id to look something up in the db

  // now pretend like the record exists but the user just isn't authorized to
  // see it.
  if (params.id === 'forbidden') {
    throw json({ webmasterEmail: 'hello@remix.run' }, { status: 401 });
  }

  if (!params.id?.match?.(/[0-9a-f]{6}/)) {
    throw new Response('Not Found', { status: 404 });
  }

  const color = params.id;

  const data: ColorsIdData = {
    color,
    colorNames: await db.colorName.findMany({
      take: 10,
      select: { name: true, glossarist: { select: { username: true } } },
      where: { color },
      orderBy: { createdAt: 'desc' },
    }),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function ColorsId() {
  const { color, colorNames } = useLoaderData<ColorsIdData>();
  return (
    <>
      <p>
        <Link to="..">back</Link>
      </p>
      <h1>
        The color is <i style={{ color: `#${color}` }}>#{color}</i>
      </h1>
      <p>It&apos;s known by many names:</p>
      <ul>
        {colorNames.map(({ name, glossarist: { username } }) => (
          <li key={username}>
            {name} by {username}
          </li>
        ))}
      </ul>
      <Form method="post" action="..">
        <input type="color" name="hexColor" defaultValue={`#${color}`} />
        <input type="submit" />
      </Form>
    </>
  );
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data ? `Color #${data.color} on moodboardr` : 'Oops...',
  };
};
