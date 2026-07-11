import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GlobalSearch from './GlobalSearch';

export default function Layout() {
  return (
    <div className="absolute inset-0 pointer-events-none text-white overflow-hidden font-sans">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-full max-w-5xl">
        <Topbar />
      </div>
      <div className="absolute top-24 left-6 bottom-24 z-50 pointer-events-auto">
        <Sidebar />
      </div>
      <main className="absolute inset-0 z-10 pointer-events-none">
        <Outlet />
        <GlobalSearch />
      </main>
    </div>
  );
}
