import type { LoaderFunction, ActionFunction } from "remix";
import { useLoaderData, json, Link, Form, redirect } from "remix";
import { db } from "~/utils/db.server";

const randomColor = () => [...Array(6).keys()].map(() => Math.floor(Math.random()*16).toString(16)).join('');

type ColorsIndexData = {
  namedColors: {
    color: string;
    name: string;
  }[];
  randomColors: string[];
};

export const loader: LoaderFunction = async () => {
  const data: ColorsIndexData = {
    namedColors: await db.colorName.findMany({
      take: 10,
      select: { color: true, name: true },
      orderBy: { createdAt: "desc" }
    }),
    randomColors: [...Array(10).keys()].map(() => randomColor()),
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
  const {randomColors, namedColors} = useLoaderData<ColorsIndexData>();

  return (
    <div>
      <p>
        Here are some recently named colors:
      </p>
      <ul>
        {namedColors.map(({color, name}) => (
          <li key={color}>
            <Link to={color}>{'#'}{color} aka {name}</Link>
          </li>
        ))}
      </ul>
      <p>
        Here are some random colors:
      </p>
      <ul>
        {randomColors.map((color) => (
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
