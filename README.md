# React + Vite

## Saving completed admission applications

At final submission, the frontend can send the saved application sections to
`POST /api/admission/student-details` with the existing `form_id`. The request
uses the backend's confirmed flat fields for student and address data, plus
snake_case `parents`, `siblings`, `academic`, and `additional` section data.

Set `VITE_ADMISSION_FORM_UPSERT_ENABLED=true` only after the backend supports
updating an existing form by `form_id`. Leave it unset until then; the current
backend implementation creates a new form for every POST and could create a
duplicate.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
