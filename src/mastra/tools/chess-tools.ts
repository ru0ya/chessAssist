import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ===== Types =====
interface ChessApiResponse {
  text: string;
  eval: number;
  move: string;
  fen: string;
  depth: number;
  winChance: number;
  continuationArr: string[];
  mate: number | null;
  centipawns: string;
  san: string;
  lan: string;
  turn: string;
  color: string;
  piece: string;
  flags: string;
  isCapture: boolean;
  isCastling: boolean;
  isPromotion: boolean;
  from: string;
  to: string;
  fromNumeric: string;
  toNumeric: string;
  taskId: string;
  time: number;
  type: string;
}

// ===== Chess Facts Database =====
const chessFacts = [
  "The longest possible chess game is 5,949 moves.",
  "The word 'checkmate' comes from the Persian phrase 'Shah Mat' meaning 'the king is dead'.",
  "The second book ever printed in the English language was about chess.",
  "The number of possible unique chess games is greater than the number of electrons in the universe.",
  "The longest chess game theoretically possible is 5,949 moves.",
  "Emanuel Lasker was the longest-reigning world chess champion (27 years, from 1894 to 1921).",
  "The folding chessboard was invented by a priest who was forbidden to play chess.",
  "The longest official chess game lasted 269 moves (I. Nikolic vs. Arsovic, Belgrade 1989) and ended in a draw.",
  "The first chess-playing computer program was written by Alan Turing in 1951.",
  "Garry Kasparov was the youngest world chess champion at age 22 in 1985.",
  "The Queen was originally the weakest piece on the board, only able to move one square diagonally.",
  "Chess is called 'the game of kings' because it was popular among royalty in medieval times.",
  "There are 400 different possible positions after one move each by White and Black.",
  "There are 72,084 different possible positions after two moves each.",
  "There are over 9 million different possible positions after three moves each.",
  "The oldest recorded chess game dates back to 900 AD between a Baghdad historian and his student.",
  "Chess boxing is a hybrid sport combining chess and boxing in alternating rounds.",
  "The rook is called 'rook' because it comes from the Persian word 'rukh' meaning chariot.",
  "Bobby Fischer became the youngest grandmaster at age 15 in 1958 (record later broken).",
  "The 'Immortal Game' (Anderssen vs. Kieseritzky, 1851) is one of the most famous chess games ever played."
];

const famousMoves = [
  {
    game: "The Immortal Game (1851)",
    players: "Adolf Anderssen vs. Lionel Kieseritzky",
    move: "23. Bxe7 (Bishop takes e7)",
    description: "Anderssen sacrificed his queen and both rooks to deliver checkmate. This game showcases brilliant tactical play and is still studied today."
  },
  {
    game: "The Opera Game (1858)",
    players: "Paul Morphy vs. Duke of Brunswick and Count Isouard",
    move: "16. Qb8+ (Queen to b8, check)",
    description: "Morphy sacrificed material to achieve a winning position, demonstrating the importance of development and king safety."
  },
  {
    game: "The Evergreen Game (1852)",
    players: "Adolf Anderssen vs. Jean Dufresne",
    move: "19. Rad1 (Rook to d1)",
    description: "A brilliant sacrificial attack showcasing piece coordination and tactical brilliance."
  },
  {
    game: "Fischer's Game of the Century (1956)",
    players: "Donald Byrne vs. Bobby Fischer",
    move: "17...Be6!! (Bishop to e6)",
    description: "13-year-old Fischer sacrificed his queen to achieve a winning position against a top player, showcasing his prodigious talent."
  },
  {
    game: "Kasparov's Immortal (1999)",
    players: "Garry Kasparov vs. Veselin Topalov",
    move: "24. Rxd4!! (Rook takes d4)",
    description: "Kasparov sacrificed his queen for a devastating attack, demonstrating modern chess at its finest."
  },
  {
    game: "The Pearl of Wijk aan Zee (2007)",
    players: "Aronian vs. Anand",
    move: "23...Qxd4+ (Queen takes d4, check)",
    description: "A spectacular queen sacrifice leading to a forced checkmate sequence."
  },
  {
    game: "Carlsen's Brilliancy (2013)",
    players: "Magnus Carlsen vs. Fabiano Caruana",
    move: "22. Nxe6! (Knight takes e6)",
    description: "Carlsen's precise tactical blow in a World Championship candidate match."
  },
  {
    game: "Tal's Magic (1961)",
    players: "Mikhail Tal vs. Tigran Petrosian",
    move: "18. Nxb5!! (Knight takes b5)",
    description: "Tal's signature sacrificial style, creating chaos on the board."
  },
  {
    game: "The Game of Death (1993)",
    players: "Garry Kasparov vs. Nigel Short",
    move: "20. e6! (Pawn to e6)",
    description: "A powerful pawn breakthrough in a World Championship match."
  },
  {
    game: "Byrne vs. Fischer (1963)",
    players: "Robert Byrne vs. Bobby Fischer",
    move: "21...Qb2!! (Queen to b2)",
    description: "Fischer's queen infiltration leading to a devastating attack on the white king."
  }
];

// ===== Tool 1: Get Next Best Move =====
export const getNextMoveTool = createTool({
  id: 'get-next-move',
  description: 'Analyzes a chess position and recommends the best next move using Stockfish 17 engine. Requires FEN notation or move history.',
  inputSchema: z.object({
    fen: z.string().describe('Chess position in FEN notation (e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")'),
    depth: z.number().optional().describe('Analysis depth (1-18, default: 12). Higher depth = more accurate but slower.'),
    variants: z.number().optional().describe('Number of move variations to analyze (1-5, default: 1)'),
  }),
  outputSchema: z.object({
    bestMove: z.string(),
    evaluation: z.number(),
    description: z.string(),
    winChance: z.number(),
    depth: z.number(),
    variations: z.array(z.string()),
    isMate: z.boolean(),
    mateIn: z.number().nullable(),
  }),
  execute: async ({ context }) => {
    return await analyzePosition(context.fen, context.depth || 12, context.variants || 1);
  },
});

// ===== Tool 2: Get Random Chess Facts =====
export const getChessFactsTool = createTool({
  id: 'get-chess-facts',
  description: 'Provides random interesting chess facts, trivia, and historical information about the game.',
  inputSchema: z.object({
    count: z.number().optional().describe('Number of random facts to return (1-5, default: 1)'),
  }),
  outputSchema: z.object({
    facts: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const count = Math.min(context.count || 1, 5);
    const randomFacts = getRandomItems(chessFacts, count);
    return {
      facts: randomFacts,
    };
  },
});

// ===== Tool 3: Get Famous Chess Moves =====
export const getFamousMovesTool = createTool({
  id: 'get-famous-moves',
  description: 'Retrieves information about famous chess games and iconic moves from chess history.',
  inputSchema: z.object({
    count: z.number().optional().describe('Number of famous moves to return (1-5, default: 1)'),
  }),
  outputSchema: z.object({
    famousGames: z.array(z.object({
      game: z.string(),
      players: z.string(),
      move: z.string(),
      description: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const count = Math.min(context.count || 1, 5);
    const randomMoves = getRandomItems(famousMoves, count);
    return {
      famousGames: randomMoves,
    };
  },
});

// ===== Helper Functions =====

async function analyzePosition(
  fen: string,
  depth: number = 12,
  variants: number = 1
): Promise<{
  bestMove: string;
  evaluation: number;
  description: string;
  winChance: number;
  depth: number;
  variations: string[];
  isMate: boolean;
  mateIn: number | null;
}> {
  try {
    const response = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen,
        depth: Math.min(depth, 18),
        variants: Math.min(variants, 5),
      }),
    });

    if (!response.ok) {
      throw new Error(`Chess API error: ${response.status}`);
    }

    const data: ChessApiResponse[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No analysis data received from Chess API');
    }

    // Find the bestmove response
    const bestMoveData = data.find(d => d.type === 'bestmove') || data[data.length - 1];

    return {
      bestMove: `${bestMoveData.san} (from ${bestMoveData.from} to ${bestMoveData.to})`,
      evaluation: bestMoveData.eval,
      description: bestMoveData.text,
      winChance: bestMoveData.winChance,
      depth: bestMoveData.depth,
      variations: bestMoveData.continuationArr || [],
      isMate: bestMoveData.mate !== null,
      mateIn: bestMoveData.mate,
    };
  } catch (error) {
    throw new Error(
      `Failed to analyze chess position: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
