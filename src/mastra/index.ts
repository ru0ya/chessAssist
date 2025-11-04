
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
import { a2aAgentRoute } from './routes/a2a-agent-route';

export const mastra = new Mastra({
  agents: { 
    coachAgent,      // A2A orchestrator - main entry point
    chessAgent,      // General chess knowledge & facts
    tacticalAgent,   // Tactical analysis specialist
    strategicAgent,  // Strategic/positional specialist
    openingAgent,    // Opening theory specialist
    endgameAgent     // Endgame specialist
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

// Export A2A route for agent-to-agent communication
export { a2aAgentRoute };
