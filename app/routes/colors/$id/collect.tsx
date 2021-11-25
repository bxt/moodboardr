import type { LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, json, Form, redirect, useActionData } from 'remix';
import { requireColor } from '~/utils/colors';
import { prisma } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';

type ColorsIdCollectData = {
  color: string;
  existingColorName: {
    name: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  if (!params.id?.match?.(/[0-9a-f]{6}/)) {
    throw new Response('Not Found', { status: 404 });
  }

  const color = params.id;

  const color_glossaristId = { color, glossaristId: userId };

  const data: ColorsIdCollectData = {
    color,
    existingColorName: await prisma.colorName.findUnique({
      select: { name: true },
      where: { color_glossaristId },
    }),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

function validateName(name: unknown) {
  if (typeof name !== 'string' || name.length < 1) {
    return 'Names must have at least 1 character';
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
  };
  fields?: {
    name: string;
  };
};

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);
  const color = requireColor(params);

  const form = await request.formData();
  const name = form.get('name');
  if (typeof name !== 'string') {
    return { formError: `Form not submitted correctly.` };
  }

  const fields = { name };

  const fieldErrors = {
    name: validateName(name),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

  const color_glossaristId = { color, glossaristId: userId };

  const colorName = await prisma.colorName.upsert({
    where: {
      color_glossaristId,
    },
    update: {
      name,
    },
    create: {
      ...color_glossaristId,
      name,
    },
  });

  if (!colorName) {
    return { formError: `Unkonwn error, please try again.` };
  }

  return redirect(`/colors/${color}`);
};

export default function ColorsIdCollect() {
  const actionData = useActionData<ActionData | undefined>();
  const loaderData = useLoaderData<ColorsIdCollectData | null>();

  return (
    <div>
      <p>Collect the color by giving it a name:</p>

      <Form
        method="post"
        aria-describedby={
          actionData?.formError ? 'form-error-message' : undefined
        }
      >
        <label>
          Name:
          <input
            name="name"
            defaultValue={
              loaderData?.existingColorName?.name ?? actionData?.fields?.name
            }
            aria-invalid={Boolean(actionData?.fieldErrors?.name)}
            aria-describedby={
              actionData?.fieldErrors?.name ? 'name-error' : undefined
            }
          />
        </label>
        {actionData?.fieldErrors?.name ? (
          <p className="form-validation-error" role="alert" id="name-error">
            {actionData?.fieldErrors.name}
          </p>
        ) : null}

        <input type="submit" />
      </Form>

      {loaderData?.existingColorName ? (
        <>
          <p>No longer a thing?</p>
          <Form
            method="post"
            action="../delete"
            aria-describedby={
              actionData?.formError ? 'form-error-message' : undefined
            }
          >
            <input type="submit" value="un-collect (delete)" />
          </Form>
        </>
      ) : null}
    </div>
  );
}
