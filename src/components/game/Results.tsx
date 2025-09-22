import { ResultsProps } from "@/types/gameItems/items"
import CupPixelStraw from "../CupPixelStraw"


function Results({ state, onContinue }: ResultsProps) {
  const target: string[] = state?.targetPattern ?? [] 
  const cups: string[]   = state?.cups ?? []

  const cupSize = 72

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[min(92vw,760px)] nes-container !bg-white !border-4 !border-black !rounded-none p-6">
        <h2 className="text-2xl font-black mb-4 text-center">Target order</h2>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6 place-items-center">
          {target.map((hex, i) => (
            <div key={`t-${i}`} className="flex flex-col items-center gap-1">
              <CupPixelStraw
                size={cupSize}
                colors={{
                  body: hex,
                  outline: '#111111',
                  lid: '#ffffff',
                  rim: '#e5e7eb',
                  straw: '#ffffff',
                }}
              />
              <span className="text-[10px] text-black/70 font-bold">#{i + 1}</span>
            </div>
          ))}
        </div>

        {!!cups.length && (
          <>
            <h3 className="text-lg font-bold mb-2 text-center">Your final order</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6 place-items-center">
              {cups.map((hex, i) => (
                <div key={`c-${i}`} className="flex flex-col items-center gap-1">
                  <CupPixelStraw
                    size={cupSize}
                    colors={{
                      body: hex,
                      outline: '#111111',
                      lid: '#ffffff',
                      rim: '#e5e7eb',
                      straw: '#ffffff',
                    }}
                  />
                  <span className="text-[10px] text-black/70 font-bold">#{i + 1}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center">
          <button className="nes-btn is-primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default Results
