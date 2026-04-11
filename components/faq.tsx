"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    q: "How much money do I need to bring with me?",
    a: "Nepal is an affordable destination. Budget depends on your travel style and preferences.",
  },
  {
    q: "How much will a trip to Nepal cost?",
    a: "Costs vary based on duration, season, and travel style. Tours range from budget to luxury options.",
  },
  {
    q: "When should I arrive in Kathmandu, before the tour?",
    a: "We recommend arriving at least a day before your tour starts to acclimate.",
  },
  {
    q: "What is the typical tipping amount to the porters and guide?",
    a: "Tipping is appreciated at 5-10% of your tour cost or per day basis.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
          Frequently Asked Questions about traveling to Nepal
        </h2>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center hover:bg-gray-50 transition gap-3"
              >
                <span className="text-gray-900 font-semibold text-left text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-primary shrink-0 transition ${open === idx ? "rotate-180" : ""}`}
                />
              </button>
              {open === idx && <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 border-t border-gray-200 text-sm sm:text-base">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
