import CupLoader from "./CupLoader";

export function Loader() {
  return (
    <div className="grid place-items-center h-screen bg-slate-900">
      <CupLoader
        size={200}
        speedSec={1.0}
        cupColor="#22d3ee"
        lidColor="#eab308"
        strawColor="#ef4444"
        rimColor="#0f172a"
        bg="transparent"
        label="Cargando Color Nodes…"
      />
    </div>
  );
}
