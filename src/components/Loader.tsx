import CupPixelSleeveAnimated from "./CupPixelSleeveAnimated";
import GradientText from "./ui/GradientText";

export function Loader() {
  return (
    <div className="flex  items-center justify-center flex-col h-screen bg-slate-700">
      <CupPixelSleeveAnimated
        size={160}
        base="#EC5766"
        speedSec={3.1}
        angleDeg={14}
        liftPx={1.6}
        strawAngleDeg={18}
        strawLiftPx={5}
      />
      <div className="flex">
        <GradientText
          colors={["#7F5CC1", "#C15CAE", "#B0C15C",  "#C15CAE", "#7F5CC1",]}
          animationSpeed={10}
          showBorder={false}
          className="custom-class"
        >
          <h1 className="text-xl">Color Nodes!</h1>
        </GradientText>
      </div>
    </div>
  );
}
