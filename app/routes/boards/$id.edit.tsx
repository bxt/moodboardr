import { Link, json, useLoaderData, redirect, useActionData } from 'remix';
import type { LoaderFunction, MetaFunction, ActionFunction } from 'remix';
import { prisma } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';
import BoardEditor, {
  BoardEditorActionData,
  parseFormData,
} from '~/components/BoardEditor';

type BoardsIdEditData = {
  board: {
    name: string;
    intro: string;
    createdAt: string;
    artDirector: {
      username: string;
    };
    colors: {
      color: string;
      relativeSize: number;
    }[];
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  if (!params.id) throw new Response('Not Found', { status: 404 });

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      intro: true,
      createdAt: true,
      artDirector: {
        select: { username: true, id: true },
      },
      colors: {
        select: {
          color: true,
          relativeSize: true,
        },
      },
    },
  });

  if (!board) throw new Response('Board does not exist.', { status: 404 });
  if (board.artDirector.id !== userId)
    throw new Response('Not your board.', { status: 403 });

  const data: BoardsIdEditData = {
    board: { ...board, createdAt: board.createdAt.toISOString() },
  };

  // https://remix.run/api/remix#json
  return json(data);
};

type ActionData = BoardEditorActionData;

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);
  if (!params.id) throw new Response('Not Found', { status: 404 });

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      artDirector: {
        select: { username: true, id: true },
      },
    },
  });

  if (!board) throw new Response('Board does not exist.', { status: 404 });
  if (board.artDirector.id !== userId)
    throw new Response('Not your board', { status: 403 });

  const form = await request.formData();
  const parsedForm = parseFormData(form);

  if (parsedForm.fieldErrors || parsedForm.formError || !parsedForm.fields)
    return parsedForm;

  const { name, intro, colors } = parsedForm.fields;

  await prisma.board.update({
    where: {
      id: params.id,
    },
    data: {
      name,
      intro,
      colors: {
        deleteMany: {},
        create: colors.map(({ relativeSize, color }) => ({
          color: color.substr(1),
          relativeSize: parseInt(relativeSize, 10),
        })),
      },
    },
  });

  if (!board) {
    return { formError: `Unkonwn error, please try again.` };
  }

  return redirect(`/boards/${params.id}`);
};

export default function BoardsIdEdit() {
  const loaderData = useLoaderData<BoardsIdEditData>();
  const actionData = useActionData<ActionData | undefined>();

  const {
    board: {
      createdAt,
      artDirector: { username },
    },
  } = loaderData;

  return (
    <BoardEditor
      loaderData={loaderData}
      actionData={actionData}
      tagLine={
        <>
          Created by <Link to={`/users/${username}`}>{username}</Link> at{' '}
          {createdAt.substr(0, 10)}
        </>
      }
    />
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: BoardsIdEditData | null;
}) => {
  return {
    title: data?.board?.name
      ? `Editing Board ${data.board.name} on moodboardr`
      : 'Oops...',
  };
};
