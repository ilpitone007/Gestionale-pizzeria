## 2026-05-10 - [XSS] HTML generation in print window
**Vulnerability:** Raw user inputs (like order notes, names, and pizza options) were interpolated directly into an HTML string and rendered via `document.write()` in the `OrdiniAttivi.tsx` handlePrint function.
**Learning:** This could lead to a Cross-Site Scripting (XSS) vulnerability when rendering the print window, as any script tags in the notes would execute.
**Prevention:** Escape HTML special characters (&, <, >, ", ') when dynamically constructing HTML strings using a custom escapeHtml function before interpolating the values. Avoid applying escaping in JSX/React rendered content, as React inherently protects against XSS.
