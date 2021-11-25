import { Link, Form } from 'remix';
import { useCallback, useEffect, useRef, useState } from 'react';

export type BoardEditorLoaderData = {
  board: {
    name: string;
    intro: string;
    colors: {
      color: string;
      relativeSize: number;
    }[];
  };
};

function validateName(name: unknown) {
  if (typeof name !== 'string' || name.length < 1) {
    return 'Names must have at least 1 character';
  }
}

function validateIntro(intro: unknown) {
  if (typeof intro !== 'string') {
    return 'Intro must be a string';
  }
}

function validateColor(color: string) {
  if (!color.match(/#(?<color>[a-f0-9]{6})/)) {
    return 'Color must be in format #000000';
  }
}

function validateRelativeSize(relativeSizeString: string) {
  if (relativeSizeString === '') {
    return 'Size must be filled in';
  }

  const relativeSize = parseInt(relativeSizeString, 10);
  if (relativeSize.toString() !== relativeSizeString) {
    return 'Size must be a number';
  }

  if (relativeSize < 1) {
    return 'Size can not be smaller than 1';
  }
}

function validateColors(
  colors: {
    color: string;
    relativeSize: string;
  }[],
) {
  return colors.map(({ color, relativeSize }) => ({
    color: validateColor(color),
    relativeSize: validateRelativeSize(relativeSize),
  }));
}

export type BoardEditorActionData = {
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

export function parseFormData(form: FormData): BoardEditorActionData {
  const intro = form.get('intro');
  const name = form.get('name');
  const colorCountString = form.get('colorCount');
  if (
    typeof name !== 'string' ||
    typeof intro !== 'string' ||
    typeof colorCountString !== 'string'
  ) {
    return { formError: `Form not submitted correctly.` };
  }
  const colorCount = parseInt(colorCountString, 10);
  if (colorCount.toString() !== colorCountString) {
    return { formError: `Form color count not submitted correctly.` };
  }

  const colors = [...Array(colorCount).keys()].map((index) => {
    const color = form.get(`color[${index}].color`);
    const relativeSize = form.get(`color[${index}].relativeSize`);

    if (typeof color !== 'string' || typeof relativeSize !== 'string') {
      throw new Response('Form not submitted correctly', { status: 400 });
    }

    return { color, relativeSize };
  });

  const fields = { intro, name, colorCount, colors };

  const fieldErrors = {
    name: validateName(name),
    intro: validateIntro(intro),
  };
  const colorsErrors = validateColors(colors);

  if (
    Object.values(fieldErrors).some(Boolean) ||
    colorsErrors.some((colorsError) => Object.values(colorsError).some(Boolean))
  )
    return {
      fieldErrors: {
        ...fieldErrors,
        colors: colorsErrors,
      },
      fields,
    };

  return { fields };
}

export default function BoardEditor({
  tagLine,
  loaderData,
  actionData,
}: {
  tagLine: JSX.Element;
  loaderData: BoardEditorLoaderData;
  actionData: BoardEditorActionData | undefined;
}) {
  const {
    board: { name, colors },
  } = loaderData;

  const [colorCount, setColorCount] = useState(
    actionData?.fields?.colors?.length ?? colors.length,
  );

  const formRef = useRef<HTMLFormElement>(null);

  const [parsedForm, setParsedForm] = useState<BoardEditorActionData>({
    formError: 'Please fill in form',
  });
  const parsedFormFields =
    parsedForm.fieldErrors || parsedForm.formError
      ? undefined
      : parsedForm.fields;

  const refreshParsedForm = useCallback(() => {
    if (formRef.current) {
      setParsedForm(parseFormData(new FormData(formRef.current)));
    }
  }, []);

  useEffect(() => {
    refreshParsedForm();
  }, [colorCount, refreshParsedForm]);

  return (
    <>
      <h1>
        <Link to="..">Boards</Link> &raquo; {parsedFormFields?.name ?? name}
      </h1>

      <p>{tagLine}</p>

      <div className="moodboardr__board-preview">
        {(parsedFormFields?.colors
          ? parsedFormFields.colors.map(({ color, relativeSize }) => ({
              color: color.substr(1),
              relativeSize,
            }))
          : colors
        ).map(({ color, relativeSize }, index) => (
          <div
            key={index}
            className="moodboardr__board-element"
            style={{ backgroundColor: `#${color}`, flexGrow: relativeSize }}
          />
        ))}
      </div>

      <Form
        ref={formRef}
        onChange={refreshParsedForm}
        method="post"
        aria-describedby={
          actionData?.formError ? 'form-error-message' : undefined
        }
      >
        <p>
          <label>
            Name:
            <input
              name="name"
              defaultValue={actionData?.fields?.name ?? loaderData?.board?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              aria-describedby={
                actionData?.fieldErrors?.name ? 'name-error' : undefined
              }
            />
          </label>
        </p>
        {actionData?.fieldErrors?.name ? (
          <p className="form-validation-error" role="alert" id="name-error">
            {actionData?.fieldErrors.name}
          </p>
        ) : null}

        <p>
          <label>
            Intro:
            <input
              name="intro"
              defaultValue={
                actionData?.fields?.intro ?? loaderData?.board?.intro
              }
              aria-invalid={Boolean(actionData?.fieldErrors?.intro)}
              aria-describedby={
                actionData?.fieldErrors?.intro ? 'intro-error' : undefined
              }
            />
          </label>
        </p>
        {actionData?.fieldErrors?.intro ? (
          <p className="form-validation-error" role="alert" id="intro-error">
            {actionData?.fieldErrors.intro}
          </p>
        ) : null}

        <div className="moodboardr__board-colorfieldsets">
          {[...Array(colorCount).keys()].map((index) => (
            <fieldset key={index}>
              <legend>Color {index}</legend>
              <p>
                <label>
                  Color:
                  <input
                    type="color"
                    name={`color[${index}].color`}
                    defaultValue={
                      actionData?.fields?.colors?.[index]?.color ??
                      `#${loaderData?.board?.colors?.[index]?.color}`
                    }
                    aria-invalid={Boolean(
                      actionData?.fieldErrors?.colors?.[index]?.color,
                    )}
                    aria-describedby={
                      actionData?.fieldErrors?.colors?.[index]?.color
                        ? `color[${index}].color-error`
                        : undefined
                    }
                  />
                </label>
              </p>
              {actionData?.fieldErrors?.colors?.[index]?.color ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id={`color[${index}].color-error`}
                >
                  {actionData?.fieldErrors?.colors?.[index]?.color}
                </p>
              ) : null}

              <p>
                <label>
                  Size:
                  <input
                    type="number"
                    name={`color[${index}].relativeSize`}
                    defaultValue={
                      actionData?.fields?.colors?.[index]?.relativeSize ??
                      (loaderData?.board?.colors?.[index]?.relativeSize || '1')
                    }
                    aria-invalid={Boolean(
                      actionData?.fieldErrors?.colors?.[index]?.relativeSize,
                    )}
                    aria-describedby={
                      actionData?.fieldErrors?.colors?.[index]?.relativeSize
                        ? `color[${index}].relativeSize-error`
                        : undefined
                    }
                  />
                </label>
              </p>
              {actionData?.fieldErrors?.colors?.[index]?.relativeSize ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id={`color[${index}].relativeSize-error`}
                >
                  {actionData?.fieldErrors?.colors?.[index]?.relativeSize}
                </p>
              ) : null}
            </fieldset>
          ))}
        </div>

        <input type="hidden" name="colorCount" value={colorCount} />

        <p>
          <button
            type="button"
            onClick={() => {
              setColorCount((colorCount) => colorCount + 1);
            }}
          >
            add color
          </button>
          <button
            type="button"
            onClick={() => {
              setColorCount((colorCount) => colorCount - 1);
            }}
          >
            remove color
          </button>
        </p>

        <input type="submit" />
      </Form>
    </>
  );
}
