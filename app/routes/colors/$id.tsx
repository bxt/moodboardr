import { Link, Form, json, useLoaderData, Outlet } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';

type ColorsIdData = {
  color: string;
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
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function ColorsId() {
  const { color } = useLoaderData<ColorsIdData>();
  return (
    <>
      <p>
        <Link to="..">back</Link>
      </p>
      <h1>
        The color is <i style={{ color: `#${color}` }}>#{color}</i>
      </h1>
      <ul>
        <li>
          <Link to=".">Names</Link>
        </li>
        <li>
          <Link to="collect">Collect</Link>
        </li>
      </ul>
      <Outlet />
      <p>
        <strong>Change to another color:</strong>
      </p>
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
