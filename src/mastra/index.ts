
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { chessAgent } from './agents/chess-agent';
import { toolCallAppropriatenessScorer, completenessScorer, chessNotationScorer } from './scorers/chess-scorer';

export const mastra = new Mastra({
  agents: { chessAgent },
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
