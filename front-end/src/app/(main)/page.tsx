import LoadContentPage from "@/components/loading/LoadContentPage";
import { MainSection } from "@/components/shared/PostSection";
import { Suspense } from "react";

async function MainContentWithDelay() {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Delay 1s
  return <MainSection />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadContentPage />} key={"HomePageLoading"}>
      <MainContentWithDelay />
    </Suspense>
  );
}
