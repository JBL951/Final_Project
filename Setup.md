# Setup for TasteBase

## Prerequisites

Before starting, ensure you have these installed:

### Required Software
1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **Visual Studio Code**
   - Download from: https://code.visualstudio.com/
   - Latest stable version recommended

## 🚀 Project Download and Setup

### Step 1: Download the Project

Since this is a Replit project, you have several options:

#### Option A: Direct Download (Recommended)
1. In Replit, click on the **Files** panel
2. Click the **three dots menu** (⋯) at the top of the files panel
3. Select **Download as ZIP**
4. Extract the ZIP file to your desired local directory

#### Option B: Git Clone (if connected to GitHub)
```bash
# If the project is connected to GitHub
git clone [your-github-repo-url] tastebase
cd tastebase
```

### Step 2: Open in VS Code
```bash
# Navigate to your project directory
cd tastebase

# Open in VS Code
code .
```

### Step 3: Install Dependencies
Open VS Code's integrated terminal (`Ctrl+`` ` or `View > Terminal`) and run:

```bash
# Install all project dependencies
npm install
```

## VS Code Configuration

### Recommended Extensions

Install these extensions for the best development experience:

1. **Essential Extensions:**
   ```
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Importer
   - Auto Rename Tag
   - Bracket Pair Colorizer 2
   - Prettier - Code formatter
   - ESLint
   - GitLens
   - Thunder Client (for API testing)
   ```

2. **Install via VS Code:**
   - Press `Ctrl+Shift+X` to open Extensions panel
   - Search and install each extension above

### VS Code Settings

Create `.vscode/settings.json` in your project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "tsx/cjs"],
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Running the Application

### Development Mode

The project uses a single command to run both frontend and backend:

```bash
# Start the development server
npm run dev
```

This will:
- Start the Express server on port 5000
- Start the Vite development server
- Enable hot module replacement for frontend
- Enable auto-restart for backend changes

### Access the Application
- **Frontend**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/*

### Alternative Running Methods

If you prefer to run frontend and backend separately:

```bash
# Terminal 1: Backend only
npm run server

# Terminal 2: Frontend only (in a new terminal)
npm run client
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

```bash
# Build the entire application
npm run build

# Preview the production build
npm run preview
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Node/NPM Version Issues
```bash
# Check versions
node --version  # Should be v18+
npm --version   # Should be v8+

# If outdated, download latest from nodejs.org
```

#### 2. Port Already in Use
```bash
# Find and kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

#### 3. Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

#### 4. TypeScript Errors
- Ensure TypeScript extension is installed
- Restart VS Code TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

#### 5. Import Path Issues
- Check that paths in `tsconfig.json` and `vite.config.ts` are correct
- Restart VS Code if path aliases aren't working

### Environment Variables

If you encounter authentication or external service issues, create a `.env` file:

```env
# JWT Secret (required for authentication)
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: MongoDB connection (for production)
MONGODB_URI=mongodb://localhost:27017/tastebase

# Optional: Other service keys
# Add any additional API keys you might need
```

## Development Workflow

### Recommended Development Process

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Make Changes:**
   - Frontend files in `client/src/`
   - Backend files in `server/`
   - Shared types in `shared/`

3. **Test Changes:**
   ```bash
   npm test
   ```

4. **Format Code:**
   - Prettier will format on save (if configured)
   - Manual format: `Ctrl+Shift+P` → "Format Document"

5. **Commit Changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

### File Structure Guide

```
tastebase/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── __tests__/     # Frontend tests
├── server/                # Backend Express application
│   ├── __tests__/         # Backend tests
│   ├── data/              # Mock data
│   ├── middleware/        # Express middleware
│   ├── utils/             # Server utilities
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Storage interface
├── shared/                # Shared TypeScript definitions
├── docs/                  # Project documentation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```