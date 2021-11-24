import type { LoaderFunction } from 'remix';
import { useLoaderData, json } from 'remix';

type IndexData = {
  greeting: string;
};

// Loaders provide data to components and are only ever called on the server, so
// you can connect to a database or run any server side code you want right next
// to the component that renders it.
// https://remix.run/api/conventions#loader
export const loader: LoaderFunction = () => {
  const data: IndexData = {
    greeting: "Great that you're here. 🥳",
  };

  // https://remix.run/api/remix#json
  return json(data);
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  const { greeting } = useLoaderData<IndexData>();

  return (
    <div className="remix__page">
      <main>
        <h2>Welcome to moodboardr!</h2>
        <p>{greeting}</p>
      </main>
    </div>
  );
}
