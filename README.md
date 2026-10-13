# React + Vite

## Admission section saves

The Student Details page creates the form with `POST /api/admission/student-details`.
The returned `form_id` is stored per account and class. Each subsequent section
posts its fields to the same endpoint with that `form_id` and the account's
`nar_id`, so the backend updates the existing form.

The frontend sends only the fields currently confirmed by the backend:

- Student: `class_id`, `nar_id`, `first_name`, `mid_name`, `last_name`, `dob`,
  `birth_place`, `gender`, `religion`, `caste`, `subcaste`, `mother_tongue`,
  `category`.
- Address: `locality`, `city`, `state`, `pincode`, `perm_address`, `nationality`.
- Parents: `father_name`, `father_mobile`, `mother_name`, `mother_mobile`.
- Sibling: `sibling`, `sibling_class_id`, `sibling_student_id`.
- Academic: `previous_school`, `previous_class`, `previous_percentage`.
- Additional: `blood_group`, `identification_mark`, `medical_information`,
  `sms_sending_phone_no`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
