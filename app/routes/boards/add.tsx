import { Link, json, useLoaderData, redirect, useActionData } from 'remix';
import type { LoaderFunction, MetaFunction, ActionFunction } from 'remix';
import { prisma } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';
import BoardEditor, { parseFormData } from '~/components/BoardEditor';

type BoardsAddData = {
  recentlyNamedColors: {
    color: string;
    name: string;
  }[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const recentlyNamedColors = await prisma.colorName.findMany({
    select: {
      color: true,
      name: true,
    },
    orderBy: { createdAt: 'desc' },
    where: { glossaristId: userId },
    take: 3,
  });

  const data: BoardsAddData = {
    recentlyNamedColors,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    intro: string | undefined;
    colors: {
      color: string | undefined;
      relativeSize: string | undefined;
    }[];
  };
  fields?: {
    intro: string;
    name: string;
    colors: {
      color: string;
      relativeSize: string;
    }[];
  };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const parsedForm = parseFormData(form);

  if (parsedForm.fieldErrors || parsedForm.formError || !parsedForm.fields)
    return parsedForm;

  const { name, intro, colors } = parsedForm.fields;

  const board = await prisma.board.create({
    data: {
      artDirectorId: userId,
      name,
      intro,
      colors: {
        create: colors.map(({ relativeSize, color }) => ({
          color: color.substr(1),
          relativeSize: parseInt(relativeSize, 10),
        })),
      },
    },
  });

  return redirect(`/boards/${board.id}`);
};

export default function BoardsAdd() {
  const loaderData = useLoaderData<BoardsAddData>();

  const actionData = useActionData<ActionData | undefined>();

  return (
    <BoardEditor
      loaderData={{
        board: {
          name: '',
          intro: '',
          colors: loaderData.recentlyNamedColors.map(({ color }) => ({
            color,
            relativeSize: 1,
          })),
        },
      }}
      actionData={actionData}
      tagLine={<>Creating a fresh board</>}
    />
  );
}

export const meta: MetaFunction = () => {
  return {
    title: 'Adding a Board on moodboardr',
  };
};
