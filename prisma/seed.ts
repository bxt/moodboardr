import { PrismaClient, User } from '@prisma/client';
const db = new PrismaClient();

// "HTML" colors without duplicates, like "grey" spelling
// See https://www.w3.org/TR/css-color-3/#svg-color
const x11Colors = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32',
};

async function seed() {
  const bxt = await db.user.create({
    data: {
      username: 'bxt',
      // this is a hashed version of "twixrox"
      passwordHash:
        '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    },
  });

  const x11Bot = await db.user.create({
    data: {
      username: 'X11 bot',
      passwordHash: '',
    },
  });

  for (const colorName of getColorNames({ bxt, x11Bot })) {
    await db.colorName.create({ data: colorName });
  }

  await db.board.create({
    data: {
      name: 'Coca-Cola',
      intro: 'These are some colors I found on a cold drink.',
      artDirectorId: bxt.id,
      colors: {
        create: [
          {
            color: 'd7141e',
            relativeSize: 7,
          },
          {
            color: 'f7f7f7',
            relativeSize: 3,
          },
          {
            color: '000000',
            relativeSize: 14,
          },
          {
            color: 'c64210',
            relativeSize: 1,
          },
          {
            color: '652413',
            relativeSize: 2,
          },
        ],
      },
    },
  });

  await db.board.create({
    data: {
      name: 'XING Colors',
      intro: 'These are some colors I found on an awesome website called XING.',
      artDirectorId: bxt.id,
      colors: {
        create: [
          {
            color: 'c6f16d',
            relativeSize: 10,
          },
          {
            color: '0698a0',
            relativeSize: 5,
          },
          {
            color: '9c195b',
            relativeSize: 1,
          },
        ],
      },
    },
  });

  await db.board.create({
    data: {
      name: 'OG web colors',
      intro: '',
      artDirectorId: x11Bot.id,
      colors: {
        create: [
          '000000',
          'c0c0c0',
          '808080',
          'ffffff',
          '800000',
          'ff0000',
          '800080',
          'ff00ff',
          '008000',
          '00ff00',
          '808000',
          'ffff00',
          '000080',
          '0000ff',
          '008080',
          '00ffff',
        ].map((color) => ({
          color,
          relativeSize: 1,
        })),
      },
    },
  });

  await db.board.create({
    data: {
      name: 'Blackpink',
      intro: '',
      artDirectorId: bxt.id,
      colors: {
        create: [
          {
            color: 'f01997',
            relativeSize: 3,
          },
          {
            color: 'c0ffee',
            relativeSize: 1,
          },
          {
            color: '000000',
            relativeSize: 2,
          },
        ],
      },
    },
  });

  await db.board.create({
    data: {
      name: 'Golden Ratio',
      intro: '',
      artDirectorId: bxt.id,
      colors: {
        create: [
          {
            color: 'cba02a',
            relativeSize: 62,
          },
          {
            color: 'a33724',
            relativeSize: 38,
          },
        ],
      },
    },
  });

  await db.board.create({
    data: {
      name: 'Langweiliger als Bernd das Brot, richtig grau und ??de',
      intro: '',
      artDirectorId: bxt.id,
      colors: {
        create: [
          {
            color: 'c3cea3',
            relativeSize: 3,
          },
          {
            color: '2b3b37',
            relativeSize: 1,
          },
          {
            color: '8e7b86',
            relativeSize: 2,
          },
        ],
      },
    },
  });
}

seed();

function getColorNames({ bxt, x11Bot }: { bxt: User; x11Bot: User }) {
  return [
    ...Object.entries(x11Colors).map(([name, hexColor]) => ({
      color: hexColor.substr(1),
      name: name,
      glossarist: { connect: { id: x11Bot.id } },
    })),
    {
      color: 'ff9900',
      name: 'Beatiful Orange',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'c6f16d',
      name: 'XING Lime',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: '0698a0',
      name: 'XING Blueish',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: '9c195b',
      name: 'XING Reddish',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: '133742',
      name: 'Hacker teal',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: '421337',
      name: 'Hacker purple',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'ff9900',
      name: 'Beatiful Orange',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'fd2f10',
      name: 'Firetruck',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'c3cea3',
      name: 'Might be the most boring color ever',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'c0ffee',
      name: 'Not coffee?',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'f01997',
      name: 'Awesome Pink!',
      glossarist: { connect: { id: bxt.id } },
    },
  ];
}
