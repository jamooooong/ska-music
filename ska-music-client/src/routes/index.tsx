import { createFileRoute, Link } from "@tanstack/react-router";
import SplitText from "../components/reactBits/SplitText";
import Orb from "../components/reactBits/Orb";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

function HomeComponent() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div
          style={{
            width: "100%",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div style={{ width: "800px", height: "800px" }}>
            <Orb
              hoverIntensity={0.69}
              rotateOnHover={true}
              hue={215}
              forceHoverState={false}
            />
          </div>
        </div>
        <div
          className="text-center "
          style={{ position: "relative", zIndex: 10 }}
        >
          <SplitText
            text="SKA-MUSIC"
            className="text-6xl font-semibold text-center text-white"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
          <p className="mb-12 text-xl text-gray-300">수업별 신청곡 서비스</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/admin"
              className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-primary-dark"
            >
              관리자 페이지
            </Link>
            <Link
              to="/professor"
              className="rounded-lg bg-accent px-8 py-3 font-medium text-white transition hover:bg-primary"
            >
              교수 로그인
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
