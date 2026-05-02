import { getDB } from "./index";

export interface Prompt {
  id: string;
  name: string;
  template_id: string | null;
  collection_id: string | null;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  label: string | null;
  builder_content: string | null; // JSON string
  scratchpad_path: string | null;
  output_path: string | null;
  output_type: string | null;
  created_at: string;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

// export async function 