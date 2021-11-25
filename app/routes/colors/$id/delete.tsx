import type { LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, Form, redirect, useActionData } from 'remix';
import { db } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';

type ColorsIdCollectData = {
  color: string;
  existingColorName: {
    name: string;
  } | null;
};

export const loader: LoaderFunction = async () => {
  return redirect('.');
};

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

  if (!params.id?.match?.(/[0-9a-f]{6}/)) {
    throw new Response('Not Found', { status: 404 });
  }

  const color = params.id;

  const color_glossaristId = { color, glossaristId: userId };

  await db.colorName.delete({
    where: {
      color_glossaristId,
    },
  });

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
            action="delete"
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
