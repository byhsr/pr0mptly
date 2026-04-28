# Prompt System Architecture

## Status

- Version: v0 (MVP)
- Stability: stable for single-user local usage
- Concurrency: optimistic (builder_content only)

## Scope

This document explains:
- data model
- FS + DB sync
- prompt lifecycle (create, read, update)

## Gotchas

- FS must NEVER be written before DB conflict check
- Paths are stored, not inferred
- output.json must always be valid JSON
- builder_content is stored as string (JSON.stringify)
- DB is source of truth for structure, not FS


## 1. Core Mental Model

* **Prompt = container**
* **Version = snapshot of data**
* **Filesystem (FS) = actual content**
* **Database (DB) = structure + metadata**

---

## 2. Data Layer Design

### Tables

#### prompts (container)

* id
* name
* template_id
* collection_id
* current_version_id
* created_at
* updated_at

#### prompt_versions (actual data)

* id
* prompt_id
* version_number
* label
* builder_content (JSON string)
* scratchpad_path
* output_path
* output_type (optional)
* created_at
* updated_at

#### collections (folders)

* id
* name
* parent_id (nested folders)

---

## 3. Filesystem Design

### Structure

Initial (no versioning):

```
entries/<prompt_id>/
  scratchpad.md
  output.json
```

### Output format

```
{
  "json": {},
  "text": "",
  "xml": ""
}
```

### Key Rules

* FS stores **real editable content**
* DB stores **paths + metadata**
* Never infer paths blindly

---

## 4. Lazy Versioning Strategy

* First version → flat structure
* Only when needed → introduce `/v1/`, `/v2/`

Why:

* avoids unnecessary complexity
* keeps most prompts simple

---

## 5. Create Flow (createPrompt)

### Order is critical

1. Generate IDs
2. FS setup
3. DB transaction
4. Return

### Why FS first?

* ensures files exist before DB references them
* avoids broken DB state

### Failure Handling

* If DB fails → delete FS folder

---

## 6. Read Flow (getPrompt)

### Steps

1. Fetch prompt + current version from DB
2. Parse builder_content
3. Read FS files
4. Safe fallbacks if FS fails
5. Return merged object

### Key Idea

* DB = source of truth for structure
* FS = best-effort content

---

## 7. Update Flow (updatePromptContent)

### What can update

* scratchpad (FS)
* output (FS)
* builder_content (DB)

### Critical Order

1. DB check (concurrency guard)
2. FS writes

### Why?

* prevents overwriting files if data is stale

---

## 8. Concurrency Control

### Problem

Multiple updates can overwrite each other silently

### Solution: Optimistic Concurrency

* Use `updated_at`

Update query:

```
UPDATE prompt_versions
SET builder_content = ?, updated_at = ?
WHERE id = ? AND updated_at = ?
```

### Behavior

* Match → update succeeds
* Mismatch → reject (conflict)

---

## 9. Output Handling Design

### Decision

Store all formats in single JSON file

### Why

* avoids parsing ambiguity
* no delimiter hacks
* easy partial updates

### Merge Strategy

* read existing
* merge fields
* write back

---

## 10. Collections Tree

### DB is flat

* collections use parent_id
* prompts reference collection_id

### Build tree in memory

Steps:

1. fetch all collections
2. group by parent_id
3. recursive build
4. attach prompts

### Separation

* Tree = lightweight (no FS reads)
* Prompt content = loaded on demand

---

## 11. Separation of Concerns

### DB Layer

* structure
* metadata

### FS Layer

* actual content

### Service Layer

* orchestrates DB + FS

---

## 12. Key Design Decisions

### 1. FS first, DB second

Prevents broken references

### 2. Lazy versioning

Avoids unnecessary complexity

### 3. Structured output (JSON wrapper)

Avoids parsing bugs

### 4. Optimistic concurrency

Prevents silent overwrites

### 5. Tree vs Content separation

Keeps UI fast and scalable

---

## 13. Known Tradeoffs

### Current limitations

* scratchpad/output not version-locked
* last write wins for FS
* no multi-user safety

### Acceptable because

* local app
* single user
* no autosave flood

---


## 14. One-Line Summary

**DB organizes, FS stores, service keeps them in sync.**
