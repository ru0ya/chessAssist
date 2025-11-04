
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { chessAgent } from './agents/chess-agent';
import { coachAgent } from './agents/coach-agent';
import { tacticalAgent } from './agents/tactical-agent';
import { strategicAgent } from './agents/strategic-agent';
import { openingAgent } from './agents/opening-agent';
import { endgameAgent } from './agents/endgame-agent';
import { toolCallAppropriatenessScorer, completenessScorer, chessNotationScorer } from './scorers/chess-scorer';
import { createA2AHandler } from './routes/a2a-agent-route';
import { chessAnalysisWorkflow } from './workflows/chess-analysis-workflow';
import { chessLearningWorkflow } from './workflows/chess-learning-workflow';
import { gameReviewWorkflow } from './workflows/game-review-workflow';

export const mastra = new Mastra({
  agents: { 
    coachAgent,      // A2A orchestrator - main entry point
    chessAgent,      // General chess knowledge & facts
    tacticalAgent,   // Tactical analysis specialist
    strategicAgent,  // Strategic/positional specialist
    openingAgent,    // Opening theory specialist
    endgameAgent     // Endgame specialist
  },
  workflows: {
    chessAnalysisWorkflow,  // Analyzes positions and provides strategic advice
    chessLearningWorkflow,  // Creates educational content from famous games
    gameReviewWorkflow,     // Reviews entire games for mistakes and improvements
  },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, chessNotationScorer },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
});

// Export A2A handler for custom server integration
// Creates a handler for JSON-RPC 2.0 compliant endpoint: POST /a2a/agent/:agentId
// Usage: const handler = createA2AHandler(mastra); then handler(request, agentId)
// Access any agent via the agentId parameter: chessAgent, coachAgent, tacticalAgent, etc.
export { createA2AHandler };
