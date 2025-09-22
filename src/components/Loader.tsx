import CupPixelStrawAnimated from "./CupPixelStrawAnimated";


export function Loader() {
  return (
    <div className="flex  items-center justify-center flex-col h-screen bg-slate-700">
      <CupPixelStrawAnimated
        size={128}
        speedSec={1.6}       // más bajo = más rápido
        colors={{
          body: "#ef4444",
          outline: "#111",
          lid: "#fff",
          rim: "#e5e7eb",
          straw: "#fff",
        }}
      />
      <h1>
        <span style={{ color: '#7F5CC1' }}>Color</span>{' '}
        <span style={{ color: '#C15CAE' }}>Nodes</span>
        <span style={{ color: '#B0C15C' }}>!</span>
      </h1>
    </div>
  );
}
