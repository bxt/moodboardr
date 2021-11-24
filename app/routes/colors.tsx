import type { MetaFunction } from "remix";
import { Outlet } from "remix";

// Somehow Remix wants the action here or in index depending on how it's called
export {action} from './colors/index';

export const meta: MetaFunction = ({ data }) => {
  return  { title: "Colors on moodboardr" };
};

export default function ColorsIndex() {
  return (
    <Outlet />
  );
}
