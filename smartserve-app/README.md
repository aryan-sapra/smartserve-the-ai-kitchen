
# SmartServe

SmartServe is a web-based platform developed during the Nagarro Hackathon 2025. It leverages modern web technologies like Next.js, React, and Firebase to deliver an AI-enhanced user experience.

## 🚀 Features

- AI-powered components using Genkit and GoogleAI
- Form handling and validation via React Hook Form and Zod
- Data visualization using Recharts
- Smooth UI with Radix UI and TailwindCSS
- Firebase backend integration

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Firebase, Genkit AI
- **Build Tools**: Vite, TypeScript, PostCSS

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smartserve.git
cd smartserve
```

### 2. Install dependencies

```bash
cd smartserve-app
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

## 🐳 Docker Instructions

Place the `Dockerfile` and `.dockerignore` in the parent directory of `smartserve-app`, then run:

```bash
docker build -t smartserve-app .
docker run -p 3000:3000 smartserve-app
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Folder Structure

```
project-root/
├── Dockerfile
├── .dockerignore
├── smartserve-app/
│   ├── pages/
│   ├── public/
│   ├── components/
│   ├── package.json
│   └── ...
```

## 👥 Team Members

- [Your Name] - Frontend & Design
- [Your Teammate] - Backend & AI Integration

## 📜 License

This project is licensed under the MIT License.
