import type { LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, json, Link, Form, redirect } from 'remix';
import { prisma } from '~/utils/db.server';

const randomColor = () =>
  [...Array(6).keys()]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

type ColorsIndexData = {
  recentlyNamedColors: {
    color: string;
    name: string;
    glossarist: {
      username: string;
    };
  }[];
  mostNamedColors: {
    color: string;
    _count: {
      glossaristId: number;
    };
  }[];
  randomColors: string[];
};

export const loader: LoaderFunction = async () => {
  const recentlyNamedColors = await prisma.colorName.findMany({
    take: 14,
    select: {
      color: true,
      name: true,
      glossarist: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mostNamedColors = await prisma.colorName.groupBy({
    by: ['color'],
    _count: {
      glossaristId: true,
    },
    orderBy: {
      _count: {
        glossaristId: 'desc',
      },
    },
    take: 7,
  });

  const data: ColorsIndexData = {
    recentlyNamedColors,
    mostNamedColors,
    randomColors: [...Array(30).keys()].map(() => randomColor()),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

// When your form sends a POST, the action is called on the server.
// - https://remix.run/api/conventions#action
// - https://remix.run/guides/data-updates
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const hexColor = formData.get('hexColor');

  if (typeof hexColor !== 'string') {
    return json('Hex color must be a string', { status: 400 });
  }

  const matchData = hexColor.match(/#(?<color>[a-f0-9]{6})/);

  if (!matchData || !matchData.groups) {
    return json('Hex color must be in format #000000', { status: 400 });
  }

  const color = matchData.groups.color;

  return redirect(`/colors/${color}`);
};

export default function ColorsIndex() {
  const { randomColors, recentlyNamedColors, mostNamedColors } =
    useLoaderData<ColorsIndexData>();

  return (
    <div>
      <Form method="post">
        <p>
          <label>
            Navigate to a color:
            <input
              type="color"
              name="hexColor"
              defaultValue={`#${randomColor()}`}
            />
          </label>
          <input type="submit" value="Go" />
        </p>
      </Form>
      <h1>Colors</h1>
      <p>Here are some recently named colors:</p>
      <ul className="moodboardr__colorlist">
        {recentlyNamedColors.map(
          ({ color, name, glossarist: { username } }) => (
            <li key={color}>
              <Link to={color}>
                <span
                  className="moodboardr__colorlist-preview"
                  style={{ backgroundColor: `#${color}` }}
                />
                <span className="moodboardr__colorlist-hex">
                  {'#'}
                  {color}
                </span>
                <span className="moodboardr__colorlist-name">{name}</span>
              </Link>
              <span>
                by <Link to={`/users/${username}`}>{username}</Link>
              </span>
            </li>
          ),
        )}
      </ul>
      <p>Here are the most named colors:</p>
      <ul className="moodboardr__colorlist">
        {mostNamedColors.map(({ color, _count: { glossaristId } }) => (
          <li key={color}>
            <Link to={color}>
              <span
                className="moodboardr__colorlist-preview"
                style={{ backgroundColor: `#${color}` }}
              />
              <span className="moodboardr__colorlist-hex">
                {'#'}
                {color}
              </span>
              <span className="moodboardr__colorlist-name">
                {glossaristId} time{glossaristId === 1 ? '' : 's'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p>Here are some random colors:</p>
      <ul className="moodboardr__colorlist">
        {randomColors.map((color) => (
          <li key={color}>
            <Link to={color}>
              <span
                className="moodboardr__colorlist-preview"
                style={{ backgroundColor: `#${color}` }}
              />
              <span className="moodboardr__colorlist-hex">
                {'#'}
                {color}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
