import bgImage from '@/assets/orig.png'
import { PantallaFondoProps } from '@/types/appTypes'
import CupPixelSleeveAnimated from './CupPixelSleeveAnimated'

const PantallaFondo = ({ texto, subtexto, children, overlay = 'dark' }: PantallaFondoProps) => {
  return (
    <div className="relative w-full min-h-screen">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center flex justify-center items-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {overlay === 'none' ? (
          <>{children}</>
        ) : (
          <div className="bg-black/70 p-8 rounded-lg w-[min(92vw,700px)] text-center">
            <h1 className="text-white font-bold text-lg mb-4">{texto}</h1>
            {subtexto && <p className="text-white/70 text-sm mb-4">{subtexto}</p>}
            {children ? (
              <div className="mt-4">{children}</div>
            ) : (
              <div className="flex justify-center">
                    <CupPixelSleeveAnimated
                      size={160}
                      base="#b87333"
                      speedSec={1.1}
                      angleDeg={14}
                      liftPx={1.6}
                      strawAngleDeg={7}
                      strawLiftPx={0.6}
                    />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PantallaFondo
