import { useCatch, Link, Form, json, useLoaderData } from 'remix';
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
      <p>It's known by many names:</p>
      <ul>
        {colorNames.map(({ name, glossarist: { username } }) => (
          <li>
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

// https://remix.run/api/conventions#catchboundary
// https://remix.run/api/remix#usecatch
// https://remix.run/api/guides/not-found
export function CatchBoundary() {
  const caught = useCatch();

  let message: React.ReactNode;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Looks like you tried to visit a page that you do not have access to.
          Maybe ask the webmaster ({caught.data.webmasterEmail}) for access.
        </p>
      );
    case 404:
      message = (
        <p>Looks like you tried to visit a page that does not exist.</p>
      );
    default:
      message = (
        <p>
          There was a problem with your request!
          <br />
          {caught.status} {caught.statusText}
        </p>
      );
  }

  return (
    <>
      <h2>Oops!</h2>
      <p>{message}</p>
      <p>
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </p>
    </>
  );
}

// https://remix.run/api/conventions#errorboundary
// https://remix.run/api/guides/not-found
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <>
      <h2>Error!</h2>
      <p>{error.message}</p>
      <p>
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </p>
    </>
  );
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data ? `Color #${data.color} on moodboardr` : 'Oops...',
  };
};
