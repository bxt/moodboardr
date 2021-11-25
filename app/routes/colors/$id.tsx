import { Link, Form, json, useLoaderData, Outlet } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { requireColor } from '~/utils/colors';

type ColorsIdData = {
  color: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const color = requireColor(params);

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
          <Link to="related">Related</Link>
        </li>
        <li>
          <Link to="collect">Collect</Link>
        </li>
      </ul>
      <Outlet />
      <p>
        <strong>Change to another color:</strong>
      </p>
      <Form method="post" action="..?index">
        <input
          type="color"
          name="hexColor"
          key={color}
          defaultValue={`#${color}`}
        />
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
