import { Fragment } from 'react';
import type { LoaderFunction } from 'remix';
import { useLoaderData, json, Link } from 'remix';
import { requireColor } from '~/utils/colors';
import chroma from 'chroma-js';

type ColorsIdRelatedData = {
  color: string;
  relatedColors: Record<string, string[]>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const color = requireColor(params);

  const data: ColorsIdRelatedData = {
    color,
    relatedColors: {
      'Sixty degree rotations': [...Array(6).keys()].map((i) =>
        chroma(`#${color}`)
          .set('hsl.h', chroma(`#${color}`).get('hsl.h') + i * 60)
          .hex(),
      ),
      'Brightness variants': chroma
        .scale(['white', `#${color}`, 'black'])
        .colors(9)
        .slice(1, -1),
    },
  };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function ColorsIdRelated() {
  const { color, relatedColors } = useLoaderData<ColorsIdRelatedData>();
  return (
    <>
      <p>Here are some related colors to go with #{color}:</p>
      {Object.entries(relatedColors).map(([category, colors]) => (
        <Fragment key={category}>
          <h2>{category}</h2>
          <ul>
            {colors.map((hexColor) => (
              <li key={hexColor}>
                <Link
                  style={{ color: hexColor }}
                  to={`/colors/${hexColor.substr(1)}`}
                >
                  {hexColor}
                </Link>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
