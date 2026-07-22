"use cache"

import type { Metadata } from "next"
import { cacheLife } from "next/cache"

import AIFeatures from "@/components/marketing/ai-features"
import Benefits from "@/components/marketing/benefits"
import FeaturesBento from "@/components/marketing/bento-features"
import CTABanner from "@/components/marketing/cta-banner"
import EditorPreview from "@/components/marketing/editor-preview"
import Faq from "@/components/marketing/faq"
import Footer from "@/components/marketing/footer"
import Hero from "@/components/marketing/hero"
import HowItWorks from "@/components/marketing/how-it-works"
import Navbar from "@/components/marketing/nav-bar"
import Pricing from "@/components/marketing/pricing"

export const metadata: Metadata = {
  title: "Biztro | Create and publish your digital menu in minutes",
  description:
    "Create a professional QR menu for your restaurant or café, update it anytime, and share it without PDFs or technical skills.",
  keywords:
    "digital menu, QR menu, restaurant, café, digital menu board, online menu"
}

// skipcq: JS-0116
export default async function Page() {
  cacheLife("weeks")
  return (
    <div className="relative bg-taupe-100 dark:bg-taupe-950">
      <Navbar showLinks />
      <Hero />
      <EditorPreview />
      <FeaturesBento />
      <HowItWorks />
      <Benefits />
      <AIFeatures />
      <Pricing />
      <Faq />
      <CTABanner />
      <Footer />
    </div>
  )
}
