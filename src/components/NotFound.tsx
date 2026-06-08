import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)]">
      <h1 className="text-6xl font-heading font-bold mb-4">404</h1>
      <p className="text-xl text-[var(--color-muted)] mb-8">Página no encontrada</p>
      <Link 
        to="/estatal/dashboard" 
        className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-3 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
      >
        Volver al Dashboard Estatal
      </Link>
    </div>
  );
}
