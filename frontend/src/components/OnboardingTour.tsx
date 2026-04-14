import { useState, useEffect } from "react";
import { Joyride } from "react-joyride";

const TOUR_KEY = "mrt-onboarding-done";

const steps = [
  { target: "[data-tour='sidebar-nav']", content: "Navigate between pages using the sidebar menu." },
  { target: "[data-tour='search-btn']", content: "Search pages and stations with ⌘K." },
  { target: "[data-tour='notifications']", content: "Real-time notifications appear here." },
  { target: "[data-tour='language']", content: "Switch between English and Indonesian." },
  { target: "[data-tour='theme']", content: "Toggle light and dark mode." },
  { target: "[data-tour='user-menu']", content: "Access profile and logout." },
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={(event) => {
        if (event.status === "finished" || event.status === "skipped") {
          localStorage.setItem(TOUR_KEY, "true");
          setRun(false);
        }
      }}
    />
  );
}
