import { Link, json, useLoaderData } from 'remix';
import type { LoaderFunction } from 'remix';
import { prisma } from '~/utils/db.server';

type BoardsIdColorsData = {
  colors: {
    color: string;
    name?: string;
    relativeSize: number;
  }[];
};

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.id) throw new Response('Not Found', { status: 404 });

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      artDirectorId: true,
      colors: {
        select: {
          color: true,
          relativeSize: true,
        },
      },
    },
  });

  if (!board) throw new Response('Not Found', { status: 404 });

  const colorIds = board.colors.map(({ color }) => color);

  const colorNames = await prisma.colorName.findMany({
    select: { name: true, color: true },
    where: { color: { in: colorIds }, glossaristId: board.artDirectorId },
  });

  const data: BoardsIdColorsData = {
    colors: board.colors.map((c) => ({
      ...c,
      name: colorNames.find(({ color }) => color === c.color)?.name,
    })),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function BoardsId() {
  const { colors } = useLoaderData<BoardsIdColorsData>();
  return (
    <>
      <p>The board contains these colors:</p>
      <ul className="moodboardr__colorlist">
        {colors.map(({ color, relativeSize, name }) => (
          <li key={color}>
            <Link to={`/colors/${color}`}>
              <span
                className="moodboardr__colorlist-preview"
                style={{ backgroundColor: `#${color}` }}
              />
              <span className="moodboardr__colorlist-hex">
                {'#'}
                {color}
              </span>
              {name ? (
                <span className="moodboardr__colorlist-name">{name}</span>
              ) : null}
            </Link>
            Size {relativeSize}
          </li>
        ))}
      </ul>
    </>
  );
}
