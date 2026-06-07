export default function RouletteScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-heading font-bold mb-2">Mundial FC 26</h2>
      <p className="text-[var(--color-muted)] mb-12">Sorteo de Selecciones</p>
      
      <div className="w-64 h-64 border-4 border-[var(--color-primary)] rounded-full flex items-center justify-center mb-12 relative shadow-[0_0_30px_rgba(102,58,243,0.3)]">
        <div className="text-xl font-bold">[ RULETA ]</div>
      </div>
      
      <button className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-opacity-90 transition-opacity shadow-[0_0_15px_rgba(102,58,243,0.5)]">
        Girar Ruleta
      </button>
    </div>
  );
}
