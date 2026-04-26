"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

type Format = "plain" | "json" | "xml"

const mockPrompts: Record<Format, string> = {
  plain: `You are an expert B2B sales copywriter with 10+ years experience.

OBJECTIVE:
Write a compelling cold email that gets responses from busy executives.

CONTEXT:
The target audience is C-level executives at Fortune 500 companies. They receive 100+ emails per day.

CONSTRAINTS:
- Maximum 150 words
- No jargon or buzzwords
- Include a clear CTA

OUTPUT FORMAT:
Subject line + email body + P.S. line

AVOID:
- Generic openers like "I hope this email finds you well"
- Pushy sales language
- Multiple CTAs`,

  json: `{
  "persona": "You are an expert B2B sales copywriter with 10+ years experience.",
  "objective": "Write a compelling cold email that gets responses from busy executives.",
  "context": "The target audience is C-level executives at Fortune 500 companies. They receive 100+ emails per day.",
  "constraints": [
    "Maximum 150 words",
    "No jargon or buzzwords",
    "Include a clear CTA"
  ],
  "output_format": "Subject line + email body + P.S. line",
  "avoid": [
    "Generic openers like 'I hope this email finds you well'",
    "Pushy sales language",
    "Multiple CTAs"
  ]
}`,

  xml: `<prompt>
  <persona>You are an expert B2B sales copywriter with 10+ years experience.</persona>
  
  <objective>Write a compelling cold email that gets responses from busy executives.</objective>
  
  <context>The target audience is C-level executives at Fortune 500 companies. They receive 100+ emails per day.</context>
  
  <constraints>
    <item>Maximum 150 words</item>
    <item>No jargon or buzzwords</item>
    <item>Include a clear CTA</item>
  </constraints>
  
  <output_format>Subject line + email body + P.S. line</output_format>
  
  <avoid>
    <item>Generic openers like "I hope this email finds you well"</item>
    <item>Pushy sales language</item>
    <item>Multiple CTAs</item>
  </avoid>
</prompt>`,
}

export function PromptPanel() {
  const [format, setFormat] = useState<Format>("plain")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mockPrompts[format])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Format Selector */}
      <div className="border-b border-border p-4">
        <div className="inline-flex rounded-lg bg-background p-1">
          {(["plain", "json", "xml"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                format === f
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Code Block */}
      <div className="relative flex-1 overflow-hidden p-4">
        <pre className="h-full overflow-y-auto rounded-lg border border-border bg-background p-4 text-sm text-foreground font-mono leading-relaxed">
          {mockPrompts[format]}
        </pre>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute bottom-8 right-8 flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-border transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-accent" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
