# AI Development Rules for AeroDoc

This document outlines the core technologies used in the AeroDoc project and provides clear guidelines on which libraries and tools to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and optimal performance of the application.

## Tech Stack Overview

*   **Frontend Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **UI Library**: shadcn/ui (built on Radix UI)
*   **Styling**: Tailwind CSS
*   **Routing**: React Router (specifically `react-router-dom`)
*   **State Management & Data Fetching**: TanStack Query
*   **Backend & Database**: Node.js (Express.js), MongoDB (Mongoose)
*   **Icons**: Lucide React
*   **Form Management**: React Hook Form
*   **Date Utilities**: date-fns

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these specific guidelines for library usage:

1.  **UI Components**:
    *   **Primary Choice**: Always use components from `shadcn/ui`. These components are pre-styled with Tailwind CSS and integrate seamlessly.
    *   **Custom Components**: If a required UI component is not available in `shadcn/ui` or needs significant customization, create a *new* component file (e.g., `src/components/MyCustomComponent.tsx`). **Do NOT modify existing `shadcn/ui` component files.** Style all custom components using Tailwind CSS.

2.  **Styling**:
    *   **Exclusive Use**: All styling must be done using **Tailwind CSS** utility classes. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (e.g., `index.css`).
    *   **Responsiveness**: Ensure all designs are responsive and adapt well to different screen sizes (mobile, tablet, desktop).

3.  **State Management & Data Fetching**:
    *   **Server State**: Use `TanStack Query` (React Query) for managing all server-side data, including fetching, caching, synchronizing, and updating data.
    *   **Local State**: For simple component-level state, use React's `useState` and `useReducer` hooks.

4.  **Routing**:
    *   **Client-Side Navigation**: Use `react-router-dom` for all client-side routing. Define routes in `src/App.tsx`.

5.  **Icons**:
    *   **Standard**: Use icons from the `lucide-react` library.

6.  **Forms**:
    *   **Management & Validation**: Use `react-hook-form` for building and managing forms, including validation.

7.  **Backend Interactions**:
    *   **Node.js/Express.js Backend**: All interactions with the backend (database queries, authentication, file storage) must be done via the custom Node.js/Express.js API.
    *   **Authentication**: Handle user authentication (login, logout, session management) via your custom backend routes.
    *   **Database Operations**: Perform CRUD operations on the MongoDB database via Mongoose.
    *   **File Storage**: Manage file uploads and downloads using Multer and the local filesystem.

8.  **Notifications**:
    *   **Toasts**: Use the `useToast` hook (which leverages `shadcn/ui`'s `Toaster` component) for displaying transient messages like success, error, or info notifications.

9.  **Date Handling**:
    *   **Formatting & Manipulation**: Use `date-fns` for all date and time formatting, parsing, and manipulation tasks.

10. **Utility Functions**:
    *   **Shared Logic**: Place general utility functions (e.g., formatters, validators, helpers) in `src/shared/utils/index.ts`.

## Code Structure & Best Practices

*   **File Organization**: Adhere to the existing file structure:
    *   `src/pages/`: For top-level views/pages.
    *   `src/components/`: For reusable UI components.
    *   `src/hooks/`: For custom React hooks.
    *   `src/shared/`: For shared types, constants, and utility functions.
    *   `src/integrations/`: For third-party service integrations (e.g., OnlyOffice).
*   **Component Granularity**: Create new files for every new component or hook, no matter how small. Avoid adding multiple components to a single file. Aim for components that are concise and focused on a single responsibility (ideally under 100 lines of code).
*   **TypeScript**: Always use TypeScript for type safety. Define clear interfaces and types for data structures.
*   **Error Handling**: For API calls using `TanStack Query`, let errors bubble up to the query client's error handling mechanism. Avoid `try/catch` blocks directly around backend calls within `useMutation` or `useQuery` functions unless specific local error handling is required.
*   **Simplicity**: Prioritize simple and elegant solutions. Avoid over-engineering or adding unnecessary complexity.
*   **No Partial Changes**: All code changes must be complete and functional. Do not leave unimplemented features or refer to non-existent files.