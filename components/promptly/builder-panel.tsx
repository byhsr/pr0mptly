"use client"

import { useState } from "react"

type Template = "default" | "cot" | "few-shot" | "custom"

interface FieldConfig {
  id: string
  label: string
}

const templateFields: Record<Template, FieldConfig[]> = {
  default: [
    { id: "objective", label: "OBJECTIVE" },
    { id: "persona", label: "PERSONA" },
    { id: "context", label: "CONTEXT" },
    { id: "constraints", label: "CONSTRAINTS" },
    { id: "output-format", label: "OUTPUT FORMAT" },
    { id: "avoid", label: "AVOID" },
  ],
  cot: [
    { id: "objective", label: "OBJECTIVE" },
    { id: "persona", label: "PERSONA" },
    { id: "context", label: "CONTEXT" },
    { id: "reasoning-steps", label: "REASONING STEPS" },
    { id: "think-aloud", label: "THINK ALOUD" },
    { id: "constraints", label: "CONSTRAINTS" },
    { id: "output-format", label: "OUTPUT FORMAT" },
    { id: "avoid", label: "AVOID" },
  ],
  "few-shot": [
    { id: "objective", label: "OBJECTIVE" },
    { id: "persona", label: "PERSONA" },
    { id: "context", label: "CONTEXT" },
    { id: "examples", label: "EXAMPLES" },
    { id: "constraints", label: "CONSTRAINTS" },
    { id: "output-format", label: "OUTPUT FORMAT" },
    { id: "avoid", label: "AVOID" },
  ],
  custom: [
    { id: "custom", label: "CUSTOM PROMPT" },
  ],
}

const mockFieldData: Record<string, string> = {
  objective: "Write a compelling cold email that gets responses from busy executives.",
  persona: "You are an expert B2B sales copywriter with 10+ years experience.",
  context: "The target audience is C-level executives at Fortune 500 companies. They receive 100+ emails per day.",
  constraints: "- Maximum 150 words\n- No jargon or buzzwords\n- Include a clear CTA",
  "output-format": "Subject line + email body + P.S. line",
  avoid: "- Generic openers like 'I hope this email finds you well'\n- Pushy sales language\n- Multiple CTAs",
  "reasoning-steps": "1. Identify pain point\n2. Build credibility\n3. Present solution\n4. Call to action",
  "think-aloud": "Walk through your thought process step by step before providing the final email.",
  examples: "Example 1:\nInput: SaaS company selling project management tool\nOutput: [sample cold email]\n\nExample 2:\nInput: Consulting firm offering strategy services\nOutput: [sample cold email]",
  custom: "Enter your custom prompt structure here...",
}

export function BuilderPanel() {
  const [template, setTemplate] = useState<Template>("default")
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(mockFieldData)

  const fields = templateFields[template]

  return (
    <div className="flex h-full flex-col">
      {/* Template Selector */}
      <div className="border-b border-border p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-muted">
          Template
        </label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as Template)}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="default">Default</option>
          <option value="cot">Chain of Thought (CoT)</option>
          <option value="few-shot">Few-Shot</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Field Blocks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">
              {field.label}
            </label>
            <textarea
              value={fieldValues[field.id] || ""}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.id]: e.target.value })
              }
              className="w-full rounded-lg outline-0 border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/60 resize-none font-mono"
              rows={4}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
