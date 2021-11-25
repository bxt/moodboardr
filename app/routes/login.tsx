import type { ActionFunction } from 'remix';
import { useSearchParams, useActionData } from 'remix';
import { prisma } from '~/utils/db.server';
import {
  register,
  login,
  createUserSessionAndRedirect,
} from '~/utils/session.server';

function validateUsername(username: unknown) {
  if (typeof username !== 'string' || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');
  const redirectTo = form.get('redirectTo');
  if (
    typeof loginType !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return { formError: `Form not submitted correctly.` };
  }

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

  switch (loginType) {
    case 'login': {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return {
          fields,
          formError: `Username/Password combination is incorrect`,
        };
      }

      return createUserSessionAndRedirect(user.id, redirectTo);
    }
    case 'register': {
      const userExists = await prisma.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return {
          fields,
          formError: `User with username ${username} already exists`,
        };
      }

      const user = await register({ username, password });
      if (!user) {
        return {
          fields,
          formError: `Something went wrong trying to create a new user.`,
        };
      }
      return createUserSessionAndRedirect(user.id, redirectTo);
    }
    default: {
      return { fields, formError: `Login type invalid` };
    }
  }
};

export default function Login() {
  const actionData = useActionData<ActionData | undefined>();
  const [searchParams] = useSearchParams();

  return (
    <div className="container">
      <h1>Login</h1>
      <form
        method="post"
        aria-describedby={
          actionData?.formError ? 'form-error-message' : undefined
        }
      >
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get('redirectTo') ?? undefined}
        />
        <fieldset>
          <legend className="sr-only">Login or Register?</legend>
          <label>
            <input
              type="radio"
              name="loginType"
              value="login"
              defaultChecked={
                !actionData?.fields?.loginType ||
                actionData?.fields?.loginType === 'login'
              }
            />{' '}
            Login
          </label>
          <label>
            <input
              type="radio"
              name="loginType"
              value="register"
              defaultChecked={actionData?.fields?.loginType === 'register'}
            />{' '}
            Register
          </label>
        </fieldset>
        <div>
          <p>
            <label>
              Username:
              <input
                type="text"
                name="username"
                defaultValue={actionData?.fields?.username}
                aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                aria-describedby={
                  actionData?.fieldErrors?.username
                    ? 'username-error'
                    : undefined
                }
              />
            </label>
          </p>
          {actionData?.fieldErrors?.username ? (
            <p
              className="form-validation-error"
              role="alert"
              id="username-error"
            >
              {actionData?.fieldErrors.username}
            </p>
          ) : null}
        </div>
        <div>
          <p>
            <label>
              Password:
              <input
                name="password"
                type="password"
                defaultValue={actionData?.fields?.password}
                aria-invalid={
                  Boolean(actionData?.fieldErrors?.password) || undefined
                }
                aria-describedby={
                  actionData?.fieldErrors?.password
                    ? 'password-error'
                    : undefined
                }
              />
            </label>
          </p>

          {actionData?.fieldErrors?.password ? (
            <p
              className="form-validation-error"
              role="alert"
              id="password-error"
            >
              {actionData?.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData?.formError}
            </p>
          ) : null}
        </div>
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
}
