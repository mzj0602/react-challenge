# React technical assessment

**Target level:** Senior  
**Scope:** Client-side UI and API integration

---

## Project setup

**Prerequisites:** Node.js 18+

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the app**

   ```bash
   npm start
   ```

   This starts the backend (port 3099) and the React dev server. Frontend proxies to the backend (`proxy` in `package.json`).

   **Quick check:** `GET http://localhost:3099/` returns OK. Assessment endpoint: `GET http://localhost:3099/api/realfraction/properties` (or `/api/realfraction/properties` via proxy).

---

## Task: Data table on My Properties

**Objective:** Consume a REST API that returns mock data and present the payload in a **responsive table** with **smooth UI** on the **My Properties** page, including loading and error states.

**Scope:** This task applies **only** to:

- **Existing API** — `GET /api/realfraction/properties` (returns a list of properties).
- **My Properties page** — Use the existing **My Properties** tab in the header/nav (route `/my-properties`). The candidate must fetch the backend payload and display it in a table on this page. Other app routes (Marketplace, Rentals, etc.) are **not** in scope for this assessment.

**Requirements:**

- **API integration**
  - Call **`GET /api/realfraction/properties`** from the frontend (e.g. on mount or via a button).
  - Parse the JSON response and use the **`properties`** array as the source for the table.
  - Handle **loading state**: show a loading indicator while the request is in progress.
  - Handle **error state**: on network failure or non-2xx response, show a user-friendly error message; the UI must not crash or stay blank.

- **Table UI (on My Properties)**
  - On the **My Properties** page, render the API payload in a **table** (one row per property, columns for the main fields: e.g. tokenId, title, propertyType, ownerAddress, status).
  - Table must be **readable**: clear headers, aligned content, sufficient contrast.
  - Use **semantic HTML** where appropriate (e.g. `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`).

- **Responsiveness**
  - Layout must be **responsive**: usable on **mobile**, **tablet**, and **desktop**.
  - On small screens, the table may scroll horizontally and/or switch to a card/list layout, as long as the same data is shown and the UI stays clear.

- **Smooth UI / UX**
  - Use **smooth transitions** where appropriate (e.g. loading → content, or fade-in when data appears).
  - Avoid **layout jump**: reserve space or use a skeleton/placeholder so the transition from loading to data feels smooth.
  - Keep loading and error states **obvious** (no flashing or ambiguous states).

- **Assessment criteria:**
  - The properties endpoint is called and the response payload is used to populate the table **on the My Properties page** (header tab “My Properties”).
  - Loading state is visible while the request is in progress.
  - Error state is shown when the request fails (e.g. backend down or non-2xx).
  - Table displays all relevant fields from the API response; data is accurate.
  - Layout is responsive across viewport sizes.
  - No unnecessary layout jump; transitions are smooth where implemented.
  - Other routes/tabs (Marketplace, Rentals, etc.) are unaffected.

**Suggested tests:**

- On the **My Properties** page, mock `GET /api/realfraction/properties`; assert that the table renders the returned payload and shows loading then content (or error when the mock fails).
- Assert that loading and error states are visible and that the table is not rendered (or is empty) until data is received.
- Optionally: test responsive behavior (e.g. table or card layout at different widths) and that other nav tabs are not broken.

---

## Project overview (for test setup)

### Tech stack

- **Runtime:** Node.js 18+
- **Frontend:** React (Create React App), React Router, Bootstrap 5
- **API client:** `fetch` (or equivalent); frontend proxies to backend
- **Backend:** Express.js on port 3099 (see server docs for API details)

**Response shape for `GET /api/realfraction/properties` (200):**

```json
{
  "success": true,
  "properties": [
    { "tokenId": 1, "title": "Sunset Villa", "propertyType": "House", "ownerAddress": "0x...", "status": "listed" },
    ...
  ]
}
```

The candidate uses the **`properties`** array from the response to populate the table **on the My Properties page** (the tab in the header). Column choice (e.g. tokenId, title, propertyType, ownerAddress, status) is up to the candidate as long as the data is accurately displayed.