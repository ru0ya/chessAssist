# Chess Assist

An intelligent chess coaching system powered by AI agents and the Stockfish 17 engine. Chess Assist uses **Agent-to-Agent (A2A) protocol** to coordinate multiple specialized AI agents that provide comprehensive chess analysis, coaching, and learning resources.

## 🎯 Overview

Chess Assist is built on the [Mastra framework](https://mastra.ai) and implements a multi-agent architecture where specialized agents collaborate to provide expert-level chess analysis. The system combines the computational power of Stockfish 17 with AI-driven strategic insights to help players improve their game.

## ✨ Features

### 🤖 Specialized AI Agents

- **Coach Agent** - Orchestrates all specialist agents and synthesizes comprehensive analysis
- **Chess Agent** - Provides general chess knowledge, facts, and historical information
- **Tactical Agent** - Analyzes tactical patterns, combinations, and forcing sequences
- **Strategic Agent** - Evaluates long-term planning and positional factors
- **Opening Agent** - Specializes in opening theory and repertoire building
- **Endgame Agent** - Handles endgame theory and technique

### 🔄 Intelligent Workflows

- **Chess Analysis Workflow** - Deep position analysis with strategic advice
- **Chess Learning Workflow** - Educational content from famous games
- **Game Review Workflow** - Complete game reviews with mistake detection

### 🛠️ Core Capabilities

- **Position Analysis** - Powered by Stockfish 17 engine via Chess API
- **Move Recommendations** - Best move suggestions with detailed explanations
- **Historical Games** - Access to famous chess games and brilliant moves
- **Chess Facts** - Interesting trivia and historical information
- **FEN Notation Support** - Standard chess position notation
- **Evaluation Metrics** - Win chances, centipawn evaluation, and mate detection

### 📊 Evaluation & Scoring

- **Tool Call Appropriateness** - Ensures correct tool usage
- **Completeness Scorer** - Validates response quality
- **Chess Notation Scorer** - Verifies proper algebraic notation usage

## 🏗️ Architecture


## 🚀 Technologies Used

### Core Framework
- **[Mastra](https://mastra.ai)** ^0.23.3 - AI agent framework with A2A protocol support
- **Node.js** >= 20.9.0 - JavaScript runtime
- **TypeScript** ^5.9.3 - Type-safe development

### AI & Agents
- **Google Gemini 2.5** - AI models (Flash Lite & Pro)
- **@mastra/core** - Agent orchestration and workflows
- **@mastra/evals** - Agent evaluation and scoring
- **@mastra/memory** - Persistent agent memory

### Chess Engine
- **Stockfish 17** - Via Chess API (https://chess-api.com)
- **FEN Notation** - Standard position representation
- **Algebraic Notation** - Standard move notation

### Storage & Logging
- **LibSQL** (@mastra/libsql) - SQLite-compatible database
- **Pino Logger** (@mastra/loggers) - Structured logging

### Validation
- **Zod** ^4.1.12 - Schema validation

## 📋 Prerequisites

- **Node.js** version 20.9.0 or higher
- **npm** or **yarn** package manager
- **Google AI API key** (for Gemini models)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chessAssist
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Run the development server**
```bash
npm run dev
```

5. **Access the application**
Open your browser and navigate to `http://localhost:3000` to access the application.
