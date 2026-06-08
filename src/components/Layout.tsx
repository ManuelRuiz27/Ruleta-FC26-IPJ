import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <img src="/icono oficial/Recurso 6.png" alt="Instituto Potosino de la Juventud" className="h-10" />
          <h1 className="text-[var(--color-heading)] font-heading font-bold text-xl tracking-tight hidden sm:block border-l pl-4 border-[var(--color-border)]">
            Mundial FC 26
          </h1>
        </div>
        <nav className="space-x-4">
          <Link to="/estatal/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">Estatal</Link>
          {/* Link temporal para pruebas */}
          <Link to="/municipal/mun-1" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">Municipal (Demo)</Link>
        </nav>
      </header>
      
      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar minimalista (puedes expandirlo luego) */}
        <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-6 hidden md:block">
          <ul className="space-y-3">
            <li>
              <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-mono mb-2">Menú Operador</div>
            </li>
            <li><Link to="/municipal/mun-1" className="block text-sm hover:text-[var(--color-accent)]">Mi municipio</Link></li>
            <li><Link to="/municipal/mun-1/registro" className="block text-sm hover:text-[var(--color-accent)]">Registro</Link></li>
            <li><Link to="/municipal/mun-1/ruleta" className="block text-sm hover:text-[var(--color-accent)]">Sorteo / Ruleta</Link></li>
            <li><Link to="/municipal/mun-1/asignaciones" className="block text-sm hover:text-[var(--color-accent)]">Asignaciones</Link></li>
            <li><Link to="/municipal/mun-1/bracket" className="block text-sm hover:text-[var(--color-accent)]">Bracket</Link></li>
          </ul>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
