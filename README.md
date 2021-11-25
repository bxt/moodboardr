# Welcome to moodboardr!

This is an app to manage colors, color boards and patterns. It is build using [Remix](https://remix.run/docs) as a framework for making React do its thing and [Prisma](https://www.prisma.io/docs/reference) for managing an SQLite database.

**Heads up:** I'm using this app to learn about Remix, so don't expect any production quality code here.

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

To initialize the database use:

```sh
touch .env
npx prisma db push
node --require esbuild-register prisma/seed.ts
```

To see the contents of the database use `npx prisma studio`. You can remove the `prisma/dev.db` file at any time to start over.

If you do not have eslint running in your editor, you should run it manually from time to time:

```sh
npm run format
```

<details>

<summary>Deployment (coming soon)</summary>

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```

</details>

## Thank you

Special thanks to [New Work SE](https://www.new-work.se/) for sponsoring the Hackweek which I used to work on this project. If you have any interest in improving your working life I'd suggest you check out their product [XING](https://www.xing.com/).