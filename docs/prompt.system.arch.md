# Prompt System Architecture

## TL;DR

* **DB = structure + metadata**
* **FS = actual content**
* **Prompt = container → Version = snapshot → Files = content**

---

## Core Model

### Tables

* **prompts**: container (id, name, template_id, collection_id, current_version_id)
* **prompt_versions**: data (builder_content, paths, created_at, updated_at)
* **collections**: folders (parent_id for nesting)

---

## Filesystem

```
entries/<prompt_id>/
  scratchpad.md
  output.json
```

`output.json`:

```
{ "json": {}, "text": "", "xml": "" }
```

---

## Key Flows

### Create

1. Create FS (folder + files)
2. Insert DB rows
3. On failure → delete FS

### Read

1. Fetch from DB
2. Read FS (safe fallback)
3. Merge and return

### Update

1. DB check using `updated_at`
2. If valid → write FS

---

## Concurrency (minimal)

```
UPDATE ... WHERE id = ? AND updated_at = ?
```

* success → safe
* fail → reject (stale data)

---

## Collections Tree

* DB is flat → build tree in memory
* Tree = folders + prompt metadata only
* Full prompt loaded separately via `getPrompt()`

---

## Design Decisions

* FS first on create
* DB gatekeeper on update
* JSON wrapper for output (no parsing hacks)
* Lazy versioning (add /v1 later only if needed)

---

## Gotchas

* Never write FS before DB check (updates)
* Always JSON.stringify builder_content
* Don’t infer paths — store them
* FS can fail → always fallback safely

---

## Status

* MVP ready
* Single-user safe
* Last-write-wins for FS (acceptable for now)

---

## Next

* Builder UI (template → form)
* Versioning expansion
* Better conflict handling (optional)
