import type { LoaderFunction, ActionFunction } from "remix";
import { useLoaderData, json, Link, Form, redirect } from "remix";

const randomColor = () => [...Array(6).keys()].map(() => Math.floor(Math.random()*16).toString(16)).join('');

type ColorsIndexData = {
  colors: Array<string>;
};

export const loader: LoaderFunction = () => {
  const data: ColorsIndexData = {
    colors: [...Array(10).keys()].map(() => randomColor()),
  };

  // https://remix.run/api/remix#json
  return json(data);
};

// When your form sends a POST, the action is called on the server.
// - https://remix.run/api/conventions#action
// - https://remix.run/guides/data-updates
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const hexColor = formData.get("hexColor");

  if (typeof hexColor !== "string") {
    return json("Hex color must be a string", { status: 400 });
  }

  const matchData = hexColor.match(/#(?<color>[a-f0-9]{6})/);

  if (!matchData || !matchData.groups) {
    return json("Hex color must be in format #000000", { status: 400 });
  }

  const color = matchData.groups.color;

  return redirect(`/colors/${color}`);
};


export default function ColorsIndex() {
  const {colors} = useLoaderData<ColorsIndexData>();

  return (
    <div>
      <p>
        Here are some random colors:
      </p>
      <ul>
        {colors.map((color) => (
          <li key={color}>
            <Link to={color}>{'#'}{color}</Link>
          </li>
        ))}
      </ul>
      <p>
        <strong>
          Check out one of them.
        </strong>
      </p>
      <Form method="post">
        <input type="color" name="hexColor" defaultValue={`#${randomColor()}`} />
        <input type="submit" />
      </Form>
    </div>
  );
}