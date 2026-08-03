import Hero from "@/components/home/Hero";
import Introduction from "@/components/home/Introduction";
import MinistryOptions from "@/components/home/MinistryOptions";
import TeachingTopics from "@/components/home/TeachingTopics";
import AboutPreview from "@/components/home/AboutPreview";
import WhatToExpect from "@/components/home/WhatToExpect";
import SafetyAccountability from "@/components/home/SafetyAccountability";
import Testimonials from "@/components/home/Testimonials";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <MinistryOptions />
      <TeachingTopics />
      <AboutPreview />
      <WhatToExpect />
      <SafetyAccountability />
      <Testimonials />
      <FinalCta />
    </>
  );
}
