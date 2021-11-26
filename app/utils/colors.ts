import type { Params } from 'react-router-dom';

export function requireColor(params: Params) {
  if (!params.id?.match?.(/^[0-9a-f]{6}$/)) {
    throw new Response('Color must consist of 6 lower case hex digits.', {
      status: 404,
    });
  }

  const color = params.id;

  return color;
}
