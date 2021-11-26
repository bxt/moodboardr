import { Fragment } from 'react';
import type { LoaderFunction } from 'remix';
import { useLoaderData, json } from 'remix';
import { requireColor } from '~/utils/colors';
import chroma from 'chroma-js';

type ColorsIdFormatsData = {
  color: string;
  formats: Record<string, string>;
};

function formatAngle(angle: number) {
  return Number.isNaN(angle) ? '-' : `${angle}°`;
}

function formatPercentage(percentage: number) {
  return `${(percentage * 100).toFixed(1)}\u202F%`;
}

export const loader: LoaderFunction = async ({ params }) => {
  const color = requireColor(params);

  const chromaColor = chroma(color);

  const hsl = chromaColor.hsl();
  const hsv = chromaColor.hsv();
  const hsi = chromaColor.hsi();

  const formats = {
    RGB: chromaColor
      .rgb()
      .map((v) => v.toString())
      .join(', '),
    HSL: [
      formatAngle(hsl[0]),
      formatPercentage(hsl[1]),
      formatPercentage(hsl[2]),
    ].join(', '),
    HSV: [
      formatAngle(hsv[0]),
      formatPercentage(hsv[1]),
      formatPercentage(hsv[2]),
    ].join(', '),
    HSI: [
      formatAngle(hsi[0]),
      formatPercentage(hsi[1]),
      formatPercentage(hsi[2]),
    ].join(', '),
    LAB: chromaColor
      .lab()
      .map((v) => v.toFixed(2))
      .join(', '),
    LCH: chromaColor
      .lch()
      .map((v) => v.toFixed(2))
      .join(', '),
    'RGBA percentages': chromaColor
      .gl()
      .map((v) => formatPercentage(v))
      .join(', '),
    CMYK: chromaColor
      .cmyk()
      .map((v) => formatPercentage(v))
      .join(', '),
    CSS: chromaColor.css(),
    'CSS HSL': chromaColor.css('hsl'),
  };

  const data: ColorsIdFormatsData = { color, formats };

  // https://remix.run/api/remix#json
  return json(data);
};

export default function ColorsIdFormats() {
  const loaderData = useLoaderData<ColorsIdFormatsData | null>();

  return (
    <div>
      <p>Various format variants of this color:</p>
      <dl>
        {loaderData
          ? Object.entries(loaderData.formats).map(([name, value]) => (
              <Fragment key={name}>
                <dt>{name}</dt>
                <dd>
                  <code>{value}</code>
                </dd>
              </Fragment>
            ))
          : null}
      </dl>
    </div>
  );
}
