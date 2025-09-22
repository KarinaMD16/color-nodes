import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
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
                <CupPixelSleeve base={"EC5766"} />
                <CupPixelSleeve base={"E3B505"} />
                <CupPixelSleeve base={"80CED7"} />
                <CupPixelSleeve base={"7D53DE"} />
                <CupPixelSleeve base={"FF2DD1"} />
                <CupPixelSleeve base={"FFBE86"} />
            </div>
        </div>
    )
}