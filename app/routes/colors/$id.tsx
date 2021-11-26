import { Link, Form, json, useLoaderData, Outlet } from 'remix';
import type { LoaderFunction, MetaFunction } from 'remix';
import { requireColor } from '~/utils/colors';
import { NavLinkWithActive } from '~/components/NavLinkWithActive';

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
      <Form method="post" action="..?index">
        <p>
          <label>
            Navigate to a color:
            <input
              type="color"
              name="hexColor"
              key={color}
              defaultValue={`#${color}`}
            />
          </label>
          <input type="submit" value="Go" />
        </p>
      </Form>
      <h1>
        <Link to="..">Colors</Link> &raquo; #{color}
      </h1>
      <div
        className="moodboardr__color-preview"
        style={{ backgroundColor: `#${color}` }}
      />
      <nav aria-label="Color navigation" className="moodboardr__nav">
        <ul>
          <li>
            <NavLinkWithActive to="." end>
              Names
            </NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="related">Related</NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="formats">Formats</NavLinkWithActive>
          </li>
          <li>
            <NavLinkWithActive to="collect">Collect</NavLinkWithActive>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data ? `Color #${data.color} on moodboardr` : 'Oops...',
  };
};
