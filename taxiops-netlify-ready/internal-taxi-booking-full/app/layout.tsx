import './globals.css';
import { getSession } from '../lib/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await getSession();

  return (
    <html lang="id">
      <body>
        {u && (
          <aside className="sidebar">
            <div className="brand">
              Taxi<span>Ops</span>
              <small>Internal Dispatch</small>
            </div>

            <nav className="sidebar-nav">
              <a href="/dashboard">Dashboard</a>

              <a href="/bookings">Bookings</a>

              {u.role !== 'DRIVER' && (
                <>
                  <a href="/admin">Administration</a>
                  <a href="/reports">Reports</a>
                </>
              )}

              {u.role === 'DRIVER' && (
                <a href="/driver">My Orders</a>
              )}
            </nav>

            <div className="userbox">
              <b>{u.name}</b>
              <small>{u.role.replace('_', ' ')}</small>

              <form action="/api/auth/logout" method="post">
                <button type="submit">Logout</button>
              </form>
            </div>
          </aside>
        )}

        <div className={u ? 'content' : 'public'}>
          {children}
        </div>
      </body>
    </html>
  );
}
