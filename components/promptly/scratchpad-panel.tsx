"use client"

import { useState } from "react"

const mockScratchpad = `Ideas for cold email:
- Lead with a specific pain point
- Reference something recent about their company
- Keep it SHORT - max 3 sentences before the ask
- Maybe try a question as the subject line?

Research:
- Target companies growing 30%+ YoY
- Best time to send: Tuesday 10am
- Personalization tokens: {name}, {company}, {recent_news}

Random thoughts:
- What if we A/B test emoji vs no emoji in subject?
- Should we mention competitors?
- Need to track open rates vs reply rates separately`

export function ScratchpadPanel() {
  const [content, setContent] = useState(mockScratchpad)

  return (
    <div className="flex h-full flex-col p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Brain dump here. Messy is fine."
        className="flex-1 w-full rounded-lg  bg-background p-4 text-sm text-foreground placeholder:text-muted/60 focus:outline-none resize-none font-mono leading-relaxed"
      />
    </div>
  )
}
