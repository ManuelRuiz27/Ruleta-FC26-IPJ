import { Link, Outlet } from 'react-router-dom';
import { clearAccessSession, getAccessSession } from '../lib/accessSession';
import SupabaseCloudSync from './SupabaseCloudSync';

export default function Layout() {
  const profile = getAccessSession();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
      <SupabaseCloudSync />
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <img src="/icono oficial/Recurso 6.png" alt="Instituto Potosino de la Juventud" className="h-10" />
          <h1 className="text-[var(--color-heading)] font-heading font-bold text-xl tracking-tight hidden sm:block border-l pl-4 border-[var(--color-border)]">
            Mundial FC 26
          </h1>
        </div>
        <nav className="space-x-4">
          <Link to="/estatal/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">Estatal</Link>
          {profile && (
            <button
              onClick={() => {
                clearAccessSession();
                window.location.reload();
              }}
              className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Salir
            </button>
          )}
        </nav>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-6 hidden md:block">
          <ul className="space-y-3">
            <li>
              <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-mono mb-2">Menu operador</div>
            </li>
            {profile ? (
              <>
                <li className="text-sm text-[var(--color-text)]">{profile.display_name}</li>
                {profile.role === 'municipal_operator' && profile.municipality_id && (
                  <li><Link to={`/municipal/${profile.municipality_id}`} className="block text-sm hover:text-[var(--color-primary)]">Mi municipio</Link></li>
                )}
                {profile.role === 'regional_operator' && profile.region_id && (
                  <li><Link to={`/regional/${profile.region_id}`} className="block text-sm hover:text-[var(--color-primary)]">Mi region</Link></li>
                )}
                {profile.role === 'state_committee' && (
                  <li><Link to="/estatal/dashboard" className="block text-sm hover:text-[var(--color-primary)]">Dashboard estatal</Link></li>
                )}
              </>
            ) : (
              <li className="text-sm text-[var(--color-muted)]">Ingresa con PIN en la ruta asignada.</li>
            )}
          </ul>
        </aside>

        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
