Axiom Trade - Token Discovery Table Replica
This project is a high-fidelity, pixel-perfect frontend replica of the Axiom Trade token discovery table, built as part of a frontend developer assessment. It showcases a modern, responsive, and performant user interface for discovering and tracking cryptocurrency tokens.

Live Demo: [Link to your Vercel deployment]

Core Features
Pixel-Perfect UI: Meticulously styled with Tailwind CSS to match the original Axiom Trade design.

Multiple Token Categories: Tab-based navigation for "New pairs", "Final Stretch", and "Migrated" tokens.

Interactive Data Table: Includes features like sorting by column (Price, 24h Change, FDV, etc.).

Simulated Real-Time Updates: A mock WebSocket connection is simulated using setInterval to demonstrate how the UI handles live price changes, including color-flash feedback.

Responsive Design: The layout is fully responsive and optimized for devices from mobile (320px) to desktop.

Loading States: A skeleton loading component is shown during initial data fetching to prevent layout shifts and improve user experience.

Component-Based Architecture: Built with a reusable, atomic design approach in mind, making components easy to manage and scale.

Technical Stack & Design Decisions
Framework: Next.js 14 (App Router) was chosen for its performance, optimized builds, and modern React features.

Language: TypeScript is used for strict type-safety, which reduces bugs and improves code maintainability.

Styling: Tailwind CSS was selected for its utility-first approach, enabling rapid and consistent styling directly within the components.

State Management: For this replica, React Hooks (useState, useEffect, useMemo) were sufficient to manage component-level state. In a larger application, Redux Toolkit would be integrated for complex global state.

Data Fetching: The project currently uses mock data to simulate a backend. In a real-world scenario, React Query would be implemented to handle data fetching, caching, and state synchronization with a REST API.

Real-Time Data: The live price updates are currently simulated. The architecture is designed to easily integrate a real WebSocket connection (e.g., using Socket.IO or a similar library) to replace the mock.

Accessibility: Semantic HTML and basic accessibility principles were followed. For production, a component library like Radix UI or shadcn/ui would be used for fully accessible interactive elements like tooltips and modals.

How to Run Locally
Clone the repository:

git clone [https://github.com/Adi8122-prog/axiom-trade-replica.git](https://github.com/Adi8122-prog/axiom-trade-replica.git)

Navigate to the project directory:

cd axiom-trade-replica

Install dependencies:

npm install

Run the development server:

npm run dev

Open http://localhost:3000 in your browser.