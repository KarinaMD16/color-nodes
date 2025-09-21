import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { Loader } from "@/components/Loader";
import CupPixelStraw from "@/components/CupPixelStraw";
import CupPixelSleeve from "@/components/CupPixelSleeve";

export const testRoute = createRoute({
  component: testPage,
  getParentRoute: () => rootRoute,
  path: '/test',
})
function testPage() {
    return(
        <div className=" bg-slate-600 h-full">

            <CupPixelStraw />
            <div className="flex justify-center items-center">
                <CupPixelSleeve base={"EF476F"} />
                <CupPixelSleeve base={"7067CF"} />
                <CupPixelSleeve base={"1B9AAA"} />
                <CupPixelSleeve base={"06D6A0"} />
                <CupPixelSleeve base={"F8FFE5"} />
                <CupPixelSleeve base={"FFC43D"} />
            </div>
        </div>
    )
}