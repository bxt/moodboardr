import * as React from 'react';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
  json,
} from 'remix';
import type { MetaFunction, LinksFunction, LoaderFunction } from 'remix';
import { getUser } from '~/utils/session.server';

import globalStylesUrl from '~/styles/global.css';
import darkStylesUrl from '~/styles/dark.css';
import moodboardrStylesUrl from '~/styles/moodboardr.css';
import { NavLinkWithActive } from '~/components/NavLinkWithActive';

/**
 * The `links` export is a function that returns an array of objects that map to
 * the attributes for an HTML `<link>` element. These will load `<link>` tags on
 * every route in the app, but individual routes can include their own links
 * that are automatically unloaded when a user navigates away from the route.
 *
 * https://remix.run/api/app#links
 */
export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: globalStylesUrl },
    {
      rel: 'stylesheet',
      href: darkStylesUrl,
      media: '(prefers-color-scheme: dark)',
    },
    { rel: 'stylesheet', href: moodboardrStylesUrl },
  ];
};

// https://remix.run/api/conventions#meta
export const meta: MetaFunction = () => {
  return {
    title: 'moodboardr',
    description:
      'Welcome to moodboardr! A place where you can collect colors and more.',
  };
};

type RootData = {
  user: {
    username: string;
    id: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const data: RootData = {
    user,
  };

  // https://remix.run/api/remix#json
  return json(data);
};

/**
 * The root module's default export is a component that renders the current
 * route via the `<Outlet />` component. Think of this as the global layout
 * component for your app.
 */
export default function App() {
  const { user } = useLoaderData<RootData>();
  return (
    <Document>
      <Layout user={user}>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <RouteChangeAnnouncement />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

function Layout({
  children,
  user,
}: React.PropsWithChildren<{
  user?: {
    username: string;
    id: string;
  } | null;
}>) {
  return (
    <div className="moodboardr">
      <header className="moodboardr__header">
        <div className="container moodboardr__header-content">
          <Link
            to="/"
            title="Moodboardr Homepage"
            className="moodboardr__header-home-link"
          >
            <MoodboardrLogo />
          </Link>
          <nav aria-label="Main navigation" className="moodboardr__nav">
            <ul>
              <li>
                <NavLinkWithActive to="/">Home</NavLinkWithActive>
              </li>
              <li>
                <Link to="/boards">Boards</Link>
              </li>
              <li>
                <NavLinkWithActive to="/colors">Colors</NavLinkWithActive>
              </li>
              {user === undefined ? null : user ? (
                <>
                  <li>
                    <NavLinkWithActive to={`/users/${user.username}`}>
                      {user.username}
                    </NavLinkWithActive>
                  </li>
                  <li>
                    <form action="/logout" method="post">
                      <button type="submit" className="button">
                        Logout
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <NavLinkWithActive to="/login">Login</NavLinkWithActive>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <div className="moodboardr__main">
        <div className="container moodboardr__main-content">{children}</div>
      </div>
      <footer className="moodboardr__footer">
        <div className="container moodboardr__footer-content">
          <p>
            &copy; 2021 by{' '}
            <a href="https://github.com/bxt">Bernhard Häussner</a> –{' '}
            <Link to="/about">About this app</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// https://remix.run/api/conventions#catchboundary
// https://remix.run/api/remix#usecatch
// https://remix.run/api/guides/not-found
export function CatchBoundary() {
  const caught = useCatch();

  let message: React.ReactNode;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  // eslint-disable-next-line no-console
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
      </Layout>
    </Document>
  );
}

function MoodboardrLogo() {
  return <>moodboardr</>;
}

/**
 * Provides an alert for screen reader users when the route changes.
 */
// eslint-disable-next-line react/display-name
const RouteChangeAnnouncement = React.memo(() => {
  const [hydrated, setHydrated] = React.useState(false);
  const [innerHtml, setInnerHtml] = React.useState('');
  const location = useLocation();

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const firstRenderRef = React.useRef(true);
  React.useEffect(() => {
    // Skip the first render because we don't want an announcement on the
    // initial page load.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const pageTitle = location.pathname === '/' ? 'Home page' : document.title;
    setInnerHtml(`Navigated to ${pageTitle}`);
  }, [location.pathname]);

  // Render nothing on the server. The live region provides no value unless
  // scripts are loaded and the browser takes over normal routing.
  if (!hydrated) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      aria-atomic
      id="route-change-region"
      style={{
        border: '0',
        clipPath: 'inset(100%)',
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: '0',
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
      }}
    >
      {innerHtml}
    </div>
  );
});
