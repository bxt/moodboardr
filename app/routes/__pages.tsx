import { Outlet } from 'remix';

export default function Pages() {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Outlet />
    </div>
  );
}
