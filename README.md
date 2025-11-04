# chessAssist ♟️

**AI-Powered Chess Analysis with Multi-Agent A2A Protocol**

Advanced chess assistant powered by Stockfish 17 and multiple specialized AI agents working collaboratively through Agent-to-Agent (A2A) communication.

## 🎯 Features

- 🎓 **Multi-Agent Architecture** - 6 specialized agents collaborating via A2A protocol
- ⚔️ **Tactical Analysis** - Deep combination finding and threat detection
- 🏰 **Strategic Evaluation** - Positional analysis and long-term planning
- 📚 **Opening Theory** - Comprehensive opening database and repertoire building
- 👑 **Endgame Mastery** - Theoretical positions and winning techniques
- 🤖 **Stockfish 17 Integration** - Professional-grade chess engine analysis
- 💬 **Intelligent Routing** - Automatic query delegation to expert agents
- 📊 **Quality Scoring** - Built-in evaluation of agent responses
- 🔌 **A2A Protocol Endpoint** - JSON-RPC 2.0 API for agent-to-agent communication

## 🏗️ Architecture

### 6 Specialized Agents

```
                    🎓 Coach Agent (Orchestrator)
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
    ⚔️ Tactical        🏰 Strategic        ♟️ Chess
      Agent              Agent              Agent
        ↓                   ↓
    📚 Opening          👑 Endgame
      Agent              Agent
```

| Agent | Role | Specialization |
|-------|------|----------------|
| **Coach** | Orchestrator | Routes queries, synthesizes responses |
| **Chess** | Knowledge Base | Facts, history, famous games |
| **Tactical** | Tactics Expert | Combinations, threats, calculations |
| **Strategic** | Positional Expert | Structure, plans, evaluation |
| **Opening** | Theory Expert | Repertoire, main lines, novelties |
| **Endgame** | Technique Expert | Theoretical positions, winning methods |

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Development

```bash
npm run dev
```

## 💻 Usage

### Basic Usage (Recommended)

Use the **Coach Agent** for comprehensive analysis:

```javascript
import { mastra } from './src/mastra/index';

const response = await mastra.agents.coachAgent.chat({
  messages: [{
    role: 'user',
    content: 'Analyze this position: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
  }]
});
```

The coach automatically routes to appropriate specialists and synthesizes their responses.

### Direct Specialist Usage

Call specific agents for focused analysis:

```javascript
// Tactical analysis
const tactical = await mastra.agents.tacticalAgent.chat({
  messages: [{
    role: 'user',
    content: 'Find all tactics in FEN: r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'
  }]
});

// Strategic evaluation
const strategic = await mastra.agents.strategicAgent.chat({
  messages: [{
    role: 'user',
    content: 'Evaluate the pawn structure and piece placement'
  }]
});

// Opening theory
const opening = await mastra.agents.openingAgent.chat({
  messages: [{
    role: 'user',
    content: 'What opening is 1.e4 e5 2.Nf3 Nc6 3.Bb5?'
  }]
});

// Endgame technique
const endgame = await mastra.agents.endgameAgent.chat({
  messages: [{
    role: 'user',
    content: 'How do I win this rook endgame?'
  }]
});
```

## 🎯 Example Queries

### Complete Analysis
```
"Analyze this position completely: [FEN]"
→ Coach delegates to tactical, strategic, and phase-specific agents
```

### Tactical Puzzles
```
"Find the winning combination"
→ Routed to Tactical Agent for deep calculation
```

### Strategic Planning
```
"What's my long-term plan in this position?"
→ Routed to Strategic Agent for positional evaluation
```

### Opening Preparation
```
"What should I play against the Sicilian Defense?"
→ Routed to Opening Agent for repertoire suggestions
```

### Endgame Study
```
"Explain the Lucena position"
→ Routed to Endgame Agent for theoretical knowledge
```

### Chess Knowledge
```
"Tell me interesting chess facts"
→ Routed to Chess Agent for trivia and history
```

## 🔌 A2A Protocol API

The system includes a **JSON-RPC 2.0 compliant endpoint** for programmatic agent communication:

### Endpoint
```
POST /a2a/agent/:agentId
```

### Example Request
```bash
curl -X POST http://localhost:4111/a2a/agent/tacticalAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "req-001",
    "method": "generate",
    "params": {
      "message": {
        "role": "user",
        "parts": [
          {
            "kind": "text",
            "text": "Find tactics in this position"
          }
        ]
      }
    }
  }'
```

### Available Agents via API
- `coachAgent` - Orchestrator
- `tacticalAgent` - Tactics specialist
- `strategicAgent` - Strategy specialist
- `openingAgent` - Opening theory
- `endgameAgent` - Endgame technique
- `chessAgent` - General knowledge

See **[A2A Protocol Documentation](A2A_PROTOCOL.md)** for complete API reference, examples, and client implementations.

## 🛠️ Technical Stack

- **Framework**: [Mastra](https://mastra.ai) - AI agent framework with A2A support
- **Model**: Google Gemini 2.5 Flash Lite
- **Chess Engine**: Stockfish 17 via [Chess API](https://chess-api.com)
- **Memory**: LibSQL with persistent storage
- **Language**: TypeScript
- **Logging**: Pino Logger
- **Observability**: Built-in telemetry and tracing

## 📁 Project Structure

```
chessAssist/
├── src/mastra/
│   ├── agents/              # AI agents
│   │   ├── coach-agent.ts       # A2A orchestrator
│   │   ├── chess-agent.ts       # General knowledge
│   │   ├── tactical-agent.ts    # Tactics specialist
│   │   ├── strategic-agent.ts   # Strategy specialist
│   │   ├── opening-agent.ts     # Opening specialist
│   │   └── endgame-agent.ts     # Endgame specialist
│   ├── routes/              # API routes
│   │   └── a2a-agent-route.ts   # A2A protocol endpoint
│   ├── tools/               # Shared tools
│   │   └── chess-tools.ts       # Chess API integration
│   ├── scorers/             # Quality evaluation
│   │   └── chess-scorer.ts      # Response scoring
│   └── index.ts             # Configuration
├── A2A_ARCHITECTURE.md      # Full technical docs
├── A2A_PROTOCOL.md          # A2A endpoint API reference
├── A2A_QUICK_START.md       # Quick reference
├── A2A_USAGE_EXAMPLES.md    # Code examples
└── A2A_SUMMARY.md           # Implementation summary
```

## 📚 Documentation

- **[A2A Architecture](A2A_ARCHITECTURE.md)** - Complete technical documentation
- **[A2A Protocol API](A2A_PROTOCOL.md)** - JSON-RPC 2.0 endpoint reference
- **[Quick Start Guide](A2A_QUICK_START.md)** - Fast reference for common tasks
- **[Usage Examples](A2A_USAGE_EXAMPLES.md)** - Practical code examples
- **[Implementation Summary](A2A_SUMMARY.md)** - What was built and why
- **[Chess Agent Guide](CHESS_AGENT_GUIDE.md)** - Original agent documentation
- **[Optimization Summary](OPTIMIZATION_SUMMARY.md)** - Technical details

## 🎓 How A2A Works

### Automatic Query Routing

The Coach Agent analyzes incoming queries and automatically routes them to the appropriate specialists:

1. **Phase Detection** - Determines opening/middlegame/endgame
2. **Complexity Analysis** - Identifies tactical vs. strategic elements
3. **Specialist Delegation** - Calls relevant expert agents
4. **Response Synthesis** - Combines insights into comprehensive analysis

### Example Flow

```
User: "Analyze this position: [FEN]"
    ↓
Coach: Detects middlegame with tactical elements
    ↓
Coach → Tactical Agent: "Find tactical threats"
Coach → Strategic Agent: "Evaluate position"
    ↓
Coach: Synthesizes both analyses
    ↓
User: Receives comprehensive evaluation
```

## 🔧 Configuration

All agents are configured in `/src/mastra/index.ts`:

```typescript
export const mastra = new Mastra({
  agents: { 
    coachAgent,      // Main entry point
    chessAgent,      // General knowledge
    tacticalAgent,   // Tactics specialist
    strategicAgent,  // Strategy specialist
    openingAgent,    // Opening specialist
    endgameAgent     // Endgame specialist
  },
  // ... configuration
});
```

## 🎯 Tools Available

### 1. get-next-move
Analyzes positions using Stockfish 17 engine
- **Input**: FEN notation, depth (1-18), variants (1-5)
- **Output**: Best move, evaluation, win chances, variations

### 2. get-chess-facts
Provides chess trivia and historical facts
- **Input**: Count (1-5)
- **Output**: Random interesting chess facts

### 3. get-famous-moves
Retrieves legendary games and iconic moves
- **Input**: Count (1-5)
- **Output**: Famous games with context and significance

## 🌟 Key Benefits

✅ **Specialized Expertise** - Each agent masters their specific domain  
✅ **Comprehensive Analysis** - Multiple perspectives on every position  
✅ **Automatic Routing** - Smart delegation to the right experts  
✅ **Scalable Architecture** - Easy to add new specialist agents  
✅ **Professional Engine** - Stockfish 17 integration for accurate analysis  
✅ **Educational** - Learn from different aspects of chess  
✅ **Flexible** - Use coach for comprehensive or specialists for focused analysis  

## 🧪 Testing

### Run Build
```bash
npm run build
```

### Test Agents
```bash
# Test coach agent
node -e "
  import('./src/mastra/index.js').then(async ({ mastra }) => {
    const response = await mastra.agents.coachAgent.chat({
      messages: [{ role: 'user', content: 'Tell me about chess' }]
    });
    console.log(response);
  });
"
```

## 📊 Quality Scoring

All agents use specialized scorers:

- **Tool Call Appropriateness** - Evaluates correct tool usage
- **Completeness** - Checks response thoroughness
- **Chess Notation** - Validates algebraic notation accuracy

## 🔮 Future Enhancements

Potential additions to the A2A system:

- **Puzzle Agent** - Generate and solve tactical puzzles
- **Training Agent** - Personalized study plans
- **Game Analysis Agent** - Complete game annotations
- **Opponent Prep Agent** - Preparation against specific players
- **Blunder Detector** - Mistake identification and explanation

## 🤝 Contributing

Contributions welcome! The modular A2A architecture makes it easy to:

1. Add new specialist agents
2. Enhance existing agent capabilities
3. Improve routing logic in Coach Agent
4. Expand tool functionality

## 📝 License

MIT License

## 🆘 Support

For issues or questions:

1. Check the [A2A Architecture docs](A2A_ARCHITECTURE.md)
2. Review [usage examples](A2A_USAGE_EXAMPLES.md)
3. Verify FEN notation format
4. Test individual agents before coach

## 🎉 Credits

- **Chess Engine**: Stockfish 17 via Chess API
- **AI Framework**: Mastra
- **Model**: Google Gemini 2.5 Flash Lite
- **Architecture**: Multi-Agent A2A Protocol

---

**Built with ♟️ by chess enthusiasts, for chess enthusiasts**

**Version**: 1.0 | **Status**: ✅ Production Ready | **Created**: November 2025
