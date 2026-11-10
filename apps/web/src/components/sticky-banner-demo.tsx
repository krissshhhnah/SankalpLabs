import React, { useState } from "react";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { NotificationOnboardingModal } from "@/components/NotificationOnboardingModal";

export default function StickyBannerDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative flex h-[60vh] w-full flex-col overflow-y-auto">
      <StickyBanner className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        <p className="mx-0 max-w-[90%] text-white drop-shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 flex-wrap">
          <span>Never miss team feedback! Turn on desktop notifications for live cursor mentions and comments.</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-bold underline underline-offset-2 transition duration-200 hover:text-blue-100 cursor-pointer ml-1"
          >
            Enable notifications &rarr;
          </button>
        </p>
      </StickyBanner>
      <DummyContent />

      <NotificationOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 py-8">
      <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
};

