"use client"

import { useTranslations } from "next-intl"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"

const CONTACT_EMAIL = "contacto@biztro.co"

type FaqItem = {
  question: string
  answer: string
}

export default function Faq() {
  const t = useTranslations("marketing.faq")
  const items = t.raw("items") as FaqItem[]

  return (
    <section id="faq" className="pt-20 pb-28 sm:py-32">
      <div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2
          sm:gap-12 sm:px-6 lg:gap-16"
      >
        <h2
          className="font-display text-3xl tracking-tight text-balance
            text-taupe-950 sm:text-4xl dark:text-taupe-50"
        >
          {t("title")}
        </h2>
        <div>
          <Accordion type="single" collapsible>
            {items.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="dark:border-taupe-800/30"
              >
                <AccordionTrigger
                  className="text-start text-taupe-950 sm:text-lg
                    dark:text-taupe-50 [&>svg]:text-taupe-500 sm:[&>svg]:size-5"
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className="text-base text-taupe-700 dark:text-taupe-300"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="col-span-full">
          <p className="text-center text-taupe-700 dark:text-taupe-300">
            {t("contactPrefix")}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-taupe-600 hover:underline focus-visible:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
