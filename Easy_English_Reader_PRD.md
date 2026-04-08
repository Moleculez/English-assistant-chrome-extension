# Product Requirements Document (PRD)

## Product Name
**Easy English Reader**

## Version
v0.1

## Document Owner
OpenAI / Drafted for user concept development

## Last Updated
2026-04-08

---

## 1. Overview

Easy English Reader is a Chrome extension that helps English-as-a-Second-Language (ESL) users understand difficult English text while reading web pages and PDFs. When a user selects a sentence or passage, the extension analyzes the selected text together with nearby context and rewrites it into easier English using an LLM. The extension presents the simplified explanation, glossary, and brief contextual interpretation in a side panel.

The product is intended to reduce comprehension friction for ESL users without forcing them to leave the reading surface or manually copy text into a separate tool.

---

## 2. Problem Statement

Many ESL readers can decode individual words but still struggle with:

- long or syntactically dense sentences,
- idioms and figurative language,
- technical or academic terminology,
- pronouns and references that only make sense in context,
- PDFs and documents that are harder to annotate or translate smoothly.

Existing translation or dictionary tools often fail in three ways:

1. They operate at the word level rather than the sentence/discourse level.
2. They ignore local context, causing inaccurate or misleading simplifications.
3. They are cumbersome in PDFs, especially in-browser PDFs.

Easy English Reader addresses these issues by combining text selection, context retrieval, and LLM-based simplification into a lightweight reading aid.

---

## 3. Goals

### 3.1 Primary Goals

- Help ESL users understand difficult English text in real time.
- Simplify selected text into easy English while preserving meaning.
- Use nearby context to disambiguate references and terminology.
- Support both normal web pages and PDFs.
- Keep interaction lightweight enough for repeated use during reading.

### 3.2 Secondary Goals

- Build vocabulary acquisition through contextual glossary output.
- Support different proficiency levels such as A2, B1, and B2.
- Reduce tab switching and cognitive interruption during reading.
- Create a foundation for future educational features such as grammar hints, bilingual support, and reading progress tracking.

### 3.3 Non-Goals (Initial Version)

- Full document summarization.
- Full-machine translation of complete pages.
- Real-time tutoring conversation.
- OCR of scanned-image PDFs in v1.
- Native support for all browsers in v1 beyond Chrome.

---

## 4. Target Users

### 4.1 Primary Users

- ESL students reading English articles, PDFs, assignments, and technical documentation.
- International students reading academic papers, lecture notes, and course materials.
- Professionals reading business or technical English that exceeds their comfort level.

### 4.2 Secondary Users

- Native speakers who want plain-English rewrites.
- Users with reading fatigue or mild comprehension difficulties.
- Educators assisting students with reading accessibility.

---

## 5. User Personas

### Persona A: International Undergraduate Student
- Reads lecture slides, course PDFs, and online tutorials.
- Understands basic English but struggles with dense academic phrasing.
- Needs fast explanation without leaving the document.

### Persona B: Technical Professional
- Reads API docs, white papers, and long-form documentation.
- Knows technical content but finds some phrasing unclear or overly abstract.
- Wants precise simplification, not childish paraphrasing.

### Persona C: English Learner Preparing for Exams
- Reads articles to improve vocabulary and comprehension.
- Wants short explanations and glossary support.
- Prefers graded simplification aligned to language proficiency.

---

## 6. User Stories

### Core User Stories

- As an ESL reader, I want to select a difficult sentence and get an easier version immediately.
- As a user, I want the explanation to use nearby context so pronouns and references are interpreted correctly.
- As a reader of PDFs, I want similar help even when the document is not a normal HTML page.
- As a learner, I want difficult terms explained in simple definitions.
- As a user, I want results shown beside the page so I can continue reading.

### Secondary User Stories

- As a B1 learner, I want simplification matched to my proficiency level.
- As a reader, I want idioms and figurative language explained clearly.
- As a user, I want repeated words and difficult terms remembered in a glossary.
- As a user, I want privacy controls over what content is sent to the model.

---

## 7. Product Scope

### 7.1 In Scope for MVP

- Chrome extension using Manifest V3.
- Text selection on HTML pages.
- Right-click context menu for selected text.
- Side panel UI for displaying results.
- LLM-powered simplification using user selection plus local context.
- Basic glossary generation.
- User-adjustable difficulty level (A2/B1/B2 or Easy/Medium/Precise).
- PDF fallback via selected-text context menu.
- Basic history for recent analyses in current session.

### 7.2 In Scope for Phase 2

- Custom PDF viewer using PDF.js.
- Better PDF context extraction from page text.
- Grammar explanation mode.
- Bilingual explanation option.
- Saved vocabulary lists.
- User authentication and synced preferences.

### 7.3 Out of Scope for MVP

- OCR for image-only PDFs.
- Full offline inference.
- Collaborative annotation.
- Multi-user classroom features.
- Mobile browser extensions.

---

## 8. Functional Requirements

## 8.1 Text Selection Capture

The system shall allow users to select text on a webpage and invoke simplification.

**Requirements:**
- Detect text selection on HTML pages.
- Support context-menu activation on selected text.
- Store the selected text and page metadata.
- Avoid triggering on very short or empty selections.

## 8.2 Context Extraction

The system shall extract local context around the selected sentence.

**Requirements:**
- Capture nearby sentences or paragraph text.
- Capture nearest heading when available.
- Capture page title and source URL.
- For PDFs in MVP, use selected text plus document/page metadata where available.
- For custom PDF mode later, retrieve page-local text context from PDF.js text content.

## 8.3 LLM Simplification

The system shall send the selection and context to an LLM backend.

**Requirements:**
- Prompt the model to rewrite in easy English while preserving meaning.
- Return structured output including:
  - simplified text,
  - concise explanation of meaning,
  - glossary entries,
  - optional confidence score.
- Support user-selected proficiency level.
- Handle failures gracefully.

## 8.4 Result Display

The system shall display the result in a side panel.

**Requirements:**
- Show original selection.
- Show simplified text.
- Show short explanation.
- Show glossary terms and meanings.
- Allow users to rerun with a different difficulty level.
- Allow users to copy the result.

## 8.5 PDF Support

The system shall support PDF reading workflows.

**MVP Requirements:**
- Provide right-click simplification for selected text in PDF surfaces when available.
- Display analysis in the same side panel used for HTML pages.

**Phase 2 Requirements:**
- Open PDFs in a custom extension-based PDF.js viewer.
- Extract page text content for more reliable context-aware simplification.
- Associate selections with page numbers.

## 8.6 Preferences

The system shall store user preferences locally.

**Requirements:**
- Save reading level preference.
- Save tone preference such as “simpler” vs “more precise.”
- Save whether glossary should be shown.
- Save privacy settings such as “send minimum context only.”

## 8.7 History

The system shall maintain lightweight recent history.

**Requirements:**
- Show recent selections in current session.
- Let user reopen the last result.
- Optionally allow clearing local session history.

---

## 9. Non-Functional Requirements

## 9.1 Performance

- The average time from user invocation to displayed result should ideally be under 3 seconds for normal selections on stable networks.
- Side panel should open quickly and not block page interaction.
- Extension should not materially degrade normal page performance.

## 9.2 Reliability

- The system should handle failed API requests gracefully.
- Retry logic should be bounded.
- If context extraction fails, the system should still simplify the selected text alone and label the result accordingly.

## 9.3 Privacy and Security

- Only the selected text and bounded local context should be sent to the backend.
- Do not retain content server-side unless explicitly disclosed and required.
- All network traffic must use HTTPS.
- Keys must not be exposed in the client package.
- The extension shall avoid unnecessary host permissions.

## 9.4 Maintainability

- Architecture should separate content scripts, service worker orchestration, UI, and PDF viewer logic.
- Prompt templates and CEFR logic should be configurable without large code refactors.

## 9.5 Compliance / Store Readiness

- Must comply with Chrome Manifest V3.
- Must avoid remotely hosted executable code in the extension package.
- Must present clear permissions rationale for Web Store review.

---

## 10. Product Experience

## 10.1 Primary Flow: HTML Page

1. User highlights a sentence on a webpage.
2. A small action affordance appears, or user right-clicks.
3. User chooses “Simplify in Easy English.”
4. Extension collects selected text + local context.
5. Service worker calls backend.
6. Side panel opens and shows simplified output.
7. User optionally changes proficiency level and reruns.

## 10.2 Primary Flow: PDF (MVP)

1. User opens a PDF in Chrome.
2. User selects text.
3. User right-clicks and chooses “Simplify in Easy English.”
4. Extension receives selected text and document metadata.
5. Backend returns simplified version.
6. Side panel shows output.

## 10.3 Phase 2 PDF Flow

1. User opens PDF with custom viewer.
2. Viewer renders PDF and text layer with PDF.js.
3. User selects text on a page.
4. Viewer retrieves nearby text blocks from the same page.
5. Simplification request includes page number and page-local context.
6. Side panel shows improved result accuracy.

---

## 11. UX Requirements

- UI must be minimal and non-intrusive.
- Side panel must remain readable during scrolling and continued reading.
- Output should be visually segmented into:
  - Original,
  - Easy English,
  - Meaning,
  - Glossary.
- Difficulty level control must be visible and easy to change.
- Wording should be clear for language learners.
- Avoid overloading the user with multiple panels or dense analytics in MVP.

---

## 12. Technical Architecture

## 12.1 Client Components

### Content Script
Responsible for:
- detecting HTML text selections,
- extracting nearby DOM context,
- sending message payloads to the service worker.

### Service Worker
Responsible for:
- context-menu registration,
- request orchestration,
- API communication,
- session storage,
- side panel opening and coordination.

### Side Panel
Responsible for:
- displaying results,
- accepting user settings updates,
- exposing copy/retry actions,
- showing recent history.

### PDF Viewer (Phase 2)
Responsible for:
- rendering PDFs with PDF.js,
- mapping text selections to page-local text context,
- improving PDF result quality.

## 12.2 Backend Components

### API Gateway / App Server
Responsible for:
- authenticating requests,
- enforcing rate limits,
- normalizing payloads,
- calling model provider APIs.

### Prompt Layer
Responsible for:
- CEFR-aware instruction construction,
- output schema enforcement,
- failure fallback rules.

### Observability
Responsible for:
- latency monitoring,
- failure logging,
- usage aggregation,
- quality instrumentation.

---

## 13. Data Model

### Analysis Request

```json
{
  "selected_text": "string",
  "left_context": "string",
  "right_context": "string",
  "paragraph": "string",
  "heading": "string",
  "title": "string",
  "url": "string",
  "source_type": "html | pdf",
  "page_number": 0,
  "user_level": "A2 | B1 | B2"
}
```

### Analysis Response

```json
{
  "simplified": "string",
  "why": "string",
  "glossary": [
    {"term": "string", "meaning": "string"}
  ],
  "confidence": 0.0
}
```

---

## 14. Prompting Principles

The model prompt should:

- preserve factual meaning,
- simplify syntax and vocabulary,
- explain ambiguous references based on supplied context,
- explain idioms when present,
- keep important technical terms only if needed and define them simply,
- avoid hallucinating unsupported information.

Example prompt behavior:

- “Rewrite the selected text in easy English for a B1 learner.”
- “Use the context to resolve pronouns and implied references.”
- “Return short glossary definitions for difficult words.”

---

## 15. Success Metrics

## 15.1 Primary Metrics

- Selection-to-result success rate.
- Median response latency.
- Weekly active users.
- Average daily simplifications per active user.
- Repeat usage rate after first session.

## 15.2 Quality Metrics

- User-rated helpfulness of simplification.
- User-rated meaning preservation.
- Rate of glossary expansion usage.
- Rate of user re-run at a different level.

## 15.3 PDF-Specific Metrics

- Percentage of PDF selections successfully processed.
- Comparison of satisfaction between native PDF fallback and custom PDF viewer.

---

## 16. Risks and Mitigations

## 16.1 Risk: Poor PDF Integration

**Description:** Native browser PDF surfaces may not provide reliable context extraction.

**Mitigation:**
- Ship MVP with context-menu fallback.
- Build custom PDF.js viewer in Phase 2.

## 16.2 Risk: LLM Hallucination or Meaning Drift

**Description:** Simplification may distort meaning.

**Mitigation:**
- Strong prompt constraints.
- Structured outputs.
- Optional confidence score.
- User feedback on incorrect explanations.

## 16.3 Risk: Latency Too High

**Description:** Repeated reading assistance becomes unusable if requests are slow.

**Mitigation:**
- Keep context bounded.
- Cache recent results.
- Optimize backend routing and model choice.

## 16.4 Risk: Privacy Concerns

**Description:** Users may hesitate to send reading content to a model backend.

**Mitigation:**
- Provide clear privacy notice.
- Minimize transmitted text.
- Offer “selected text only” mode.

## 16.5 Risk: Chrome Web Store Review Issues

**Description:** Overbroad permissions and remote code patterns can delay approval.

**Mitigation:**
- Use minimal permissions.
- Bundle all client code locally.
- Document data use clearly.

---

## 17. MVP Definition

The MVP is complete when the extension can:

- run in Chrome under Manifest V3,
- capture selected text on standard webpages,
- allow simplification via context menu,
- collect limited surrounding context on HTML pages,
- call an LLM backend securely,
- display easy-English output in a side panel,
- support at least one adjustable reading level,
- provide basic fallback support for PDF selected text,
- store user settings locally.

---

## 18. Roadmap

## Phase 1: MVP
- MV3 extension foundation.
- HTML page support.
- Context menu + side panel.
- Backend API.
- Easy-English output + glossary.
- Basic PDF fallback.

## Phase 2: Reading Quality Upgrade
- Custom PDF.js viewer.
- Better local context retrieval.
- Glossary memory.
- Grammar explanation mode.
- Bilingual assistance.

## Phase 3: Learning Productization
- Vocabulary review system.
- Difficulty personalization.
- Cross-device sync.
- Classroom / educator features.
- Deeper analytics on reading progress.

---

## 19. Open Questions

- Which model/provider gives the best balance of latency, cost, and meaning preservation?
- Should simplification default to monolingual easy English or allow bilingual support immediately?
- How much history should be stored locally by default?
- Should the product support domain-specific modes such as academic, business, and technical reading in v1 or later?
- Should scanned PDFs be deferred until OCR quality and cost are validated?

---

## 20. Appendix: Suggested MVP API Contract

### POST `/analyze`

**Request**
```json
{
  "selected_text": "The committee’s recommendation was contingent on several unresolved procedural objections.",
  "paragraph": "The committee’s recommendation was contingent on several unresolved procedural objections. As a result, the proposal could not yet move forward.",
  "heading": "Review Process",
  "title": "Policy Update",
  "url": "https://example.com/doc",
  "source_type": "html",
  "user_level": "B1"
}
```

**Response**
```json
{
  "simplified": "The committee’s recommendation depended on several process problems that were still not solved.",
  "why": "This means the committee could not fully approve the recommendation because some official process issues remained.",
  "glossary": [
    {
      "term": "contingent",
      "meaning": "depending on something else"
    },
    {
      "term": "procedural objections",
      "meaning": "problems about official process or rules"
    }
  ],
  "confidence": 0.89
}
```

---

## 21. Final Recommendation

The product should be built as a hybrid Chrome extension:

- HTML pages handled through content scripts,
- generic PDFs supported through context-menu fallback in MVP,
- first-class PDF experience introduced later through a custom PDF.js viewer.

This sequence reduces engineering risk, speeds up time to usable prototype, and directly addresses the central user need: understanding English content quickly and accurately in context.
