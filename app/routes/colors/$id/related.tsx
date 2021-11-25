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
      'Saturation variants': [...Array(12).keys()].map((i) =>
        chroma(`#${color}`)
          .set('hsl.s', i / 12)
          .hex(),
      ),
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
          <ul className="moodboardr__colorlist">
            {colors.map((hexColor) => (
              <li key={hexColor}>
                <Link to={`/colors/${hexColor.substr(1)}`}>
                  <span
                    className="moodboardr__colorlist-preview"
                    style={{ backgroundColor: hexColor }}
                  />
                  <span className="moodboardr__colorlist-hex">{hexColor}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
