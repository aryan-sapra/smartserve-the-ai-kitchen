SmartServe — AI-Powered Corporate Cafeteria Intelligence Platform
Built during Nagarro Hackathon 2025. Shipped end to end in under 48 hours.

What It Is
SmartServe is a corporate cafeteria management platform that eliminates two problems that every large office faces but nobody talks about: kitchen staff preparing the wrong amount of food every day, and everyone flooding the cafeteria at the same time. Both problems are caused by the same root issue — the kitchen and the employees operate in complete information isolation. SmartServe fixes that with real-time check-ins and two AI-powered decision layers.

The Problem
Corporate cafeterias operate blind. Kitchen staff prepare food based on gut feel and yesterday's leftovers. Employees show up at 1PM because that is when their meeting ends, not because it is a good time. Food gets wasted because quantities were wrong. People wait 20 minutes in queue because demand is not distributed. Nobody tracks any of this in real time, and nobody feeds it back into tomorrow's planning.

How It Works
Three portals. One shared data layer.
Employee Portal
Employees check in each morning with their name, dietary preference (veg, non-veg, vegan), whether they are eating today, and their preferred lunch timing slot (12 to 1, 1 to 2, 2 to 3, or 3 to 4). This data flows in real time to both the kitchen and the admin dashboards via Firebase and storage event listeners across browser tabs.
Employees also get access to Smart Lunch Slot Suggestions. The AI analyzes how crowded each time slot is across all check-ins and suggests less congested windows specific to each employee, along with congestion level and reasoning. Employees can confirm a suggestion and it updates their preferred slot live.
Kitchen Dashboard
Kitchen staff see AI-generated dish preparation suggestions in real time, updated as employees check in. The system uses a Genkit AI flow powered by Google AI that takes total check-in counts, dietary breakdown (veg, non-veg, vegan counts), historical waste percentage, and a special event multiplier, and outputs specific dish names with portion counts and preparation notes. The dish names are constrained to a predefined menu list so the AI cannot hallucinate dishes the kitchen does not make.
For special events where the multiplier is 1.3 or higher, the AI recognizes that early check-in counts do not represent actual attendance and scales up its estimates using a derived target attendance model rather than just multiplying the low early counts. Kitchen staff can also log waste per dish, which feeds back into future suggestion quality.
Admin Dashboard
Admins see a real-time operational overview: total meal attendees for the day, most popular dietary preference with percentage breakdown, total logged food waste in kilograms aggregated across kitchen waste logs and individual consumption logs, and peak check-in time slot with percentage of attendees. All stats update live via storage event listeners without requiring a page refresh. Admins can filter by date range and department, export data, and view charts for daily check-ins, diet trends over time, and waste patterns.

AI Flows
suggestDishQuantitiesFlow
Input: total check-ins, veg count, non-veg count, vegan count, historical waste percentage, special event multiplier, day of week factor.
Output: 3 to 5 dish suggestions with name, quantity string, and preparation note.
The flow uses a structured Zod schema for both input and output, validates that every suggested dish exists in the predefined available dishes list, and filters out any hallucinated dish names before returning to the UI.
suggestSmartSlotFlow
Input: user's preferred slot, distribution of all employee preferred slots across four time windows, historical adherence factor.
Output: 1 to 3 smart slot suggestions with specific time descriptions, reasoning, and congestion level (Low, Medium, High, Very High).
The AI reasons about relative congestion across slots and suggests granular times within slots (e.g. "Try 12:45 PM") rather than just recommending a different hour block.

Tech Stack
Next.js 15, React 18, TypeScript, TailwindCSS, Radix UI, Recharts, React Hook Form, Zod, Genkit 1.8, Google AI (Gemini), Firebase 11, Docker

Architecture Decisions
Real-time sync across the employee, kitchen, and admin portals is achieved via browser StorageEvent listeners that fire whenever localStorage is updated. This means a check-in on the employee portal instantly refreshes the kitchen's dish suggestions and the admin's stats without any polling or WebSocket setup, keeping the architecture simple while achieving real-time behavior across tabs.
The AI dish suggestion prompt uses a dual-mode quantity calculation guide: standard day mode bases quantities on actual check-in counts with a small buffer, while significant event mode (multiplier above 1.3) estimates a target event attendance by multiplying a typical daily baseline by the multiplier, then derives dietary ratios from early check-ins and applies them to the scaled-up estimate. This prevents the common failure mode where low early check-in counts mislead the AI into suggesting absurdly small quantities for a large event.

Folder Structure
smartserve-the-ai-kitchen/
├── smartserve-app/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── flows/
│   │   │   │   ├── suggest-dish-quantities-flow.ts
│   │   │   │   └── suggest-smart-slot-flow.ts
│   │   │   └── genkit.ts
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── kitchen-dashboard/
│   │   │   └── dashboard/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── kitchen-dashboard/
│   │   │   └── dashboard/
│   │   └── lib/
│   └── package.json
├── Dockerfile
└── .dockerignore

Getting Started
bashgit clone https://github.com/aryan-sapra/smartserve-the-ai-kitchen
cd smartserve-the-ai-kitchen/smartserve-app
npm install
npm run dev
For Docker:
bashdocker build -t smartserve-app .
docker run -p 3000:3000 smartserve-app
Visit http://localhost:3000

What I Would Do Differently
I would spend a full day observing a real corporate cafeteria before writing any code. We made reasonable assumptions about how kitchen staff think about quantities and how employees decide when to eat, and some of those only revealed themselves as wrong once we had a working prototype. I would also move the data layer off localStorage to a proper persistent backend from day one to support true multi-device, multi-session real-time sync rather than relying on the StorageEvent cross-tab trick.

Built By
Aryan Sapra — DTU Mathematics & Computing 2027
Nagarro Hackathon 2025 — Finalist
