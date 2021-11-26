import { json, useLoaderData } from 'remix';
import type { LoaderFunction } from 'remix';
import { prisma } from '~/utils/db.server';

type BoardsIdIndexData = {
  intro: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.id) throw new Response('Not Found', { status: 404 });

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      intro: true,
    },
  });

  if (!board) throw new Response('Board does not exist', { status: 404 });

  const data: BoardsIdIndexData = {
    intro: board.intro,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function BoardsId() {
  const { intro } = useLoaderData<BoardsIdIndexData>();
  return <p>{intro}</p>;
}
