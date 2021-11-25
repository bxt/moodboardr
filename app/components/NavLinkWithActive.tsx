import type { ComponentPropsWithoutRef } from 'react';
import { NavLink } from 'remix';

export function NavLinkWithActive(
  props: ComponentPropsWithoutRef<typeof NavLink>,
) {
  return (
    <NavLink
      className={({ isActive }) => (isActive ? 'active' : '')}
      {...props}
    />
  );
}
