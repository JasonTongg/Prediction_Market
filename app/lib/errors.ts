import {
  isSolanaError,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
} from "@solana/kit";
import {
  getPredictionMarketErrorMessage,
  PREDICTION_MARKET_ERROR__ALREADY_CLAIMED,
  PREDICTION_MARKET_ERROR__ALREADY_RESOLVED,
  PREDICTION_MARKET_ERROR__BETTING_CLOSED,
  PREDICTION_MARKET_ERROR__INVALID_BET_AMOUNT,
  PREDICTION_MARKET_ERROR__NOT_RESOLVED,
  PREDICTION_MARKET_ERROR__NO_WINNINGS,
  PREDICTION_MARKET_ERROR__OVERFLOW,
  PREDICTION_MARKET_ERROR__RESOLUTION_TIME_IN_PAST,
  PREDICTION_MARKET_ERROR__RESOLUTION_TOO_EARLY,
  type PredictionMarketError,
} from "../generated/prediction_market";

const PREDICTION_MARKET_ERROR_CODES: Record<number, PredictionMarketError> = {
  [PREDICTION_MARKET_ERROR__ALREADY_CLAIMED]:
    PREDICTION_MARKET_ERROR__ALREADY_CLAIMED,
  [PREDICTION_MARKET_ERROR__ALREADY_RESOLVED]:
    PREDICTION_MARKET_ERROR__ALREADY_RESOLVED,
  [PREDICTION_MARKET_ERROR__BETTING_CLOSED]:
    PREDICTION_MARKET_ERROR__BETTING_CLOSED,
  [PREDICTION_MARKET_ERROR__INVALID_BET_AMOUNT]:
    PREDICTION_MARKET_ERROR__INVALID_BET_AMOUNT,
  [PREDICTION_MARKET_ERROR__NOT_RESOLVED]:
    PREDICTION_MARKET_ERROR__NOT_RESOLVED,
  [PREDICTION_MARKET_ERROR__NO_WINNINGS]:
    PREDICTION_MARKET_ERROR__NO_WINNINGS,
  [PREDICTION_MARKET_ERROR__OVERFLOW]: PREDICTION_MARKET_ERROR__OVERFLOW,
  [PREDICTION_MARKET_ERROR__RESOLUTION_TIME_IN_PAST]:
    PREDICTION_MARKET_ERROR__RESOLUTION_TIME_IN_PAST,
  [PREDICTION_MARKET_ERROR__RESOLUTION_TOO_EARLY]:
    PREDICTION_MARKET_ERROR__RESOLUTION_TOO_EARLY,
};

export function parseTransactionError(err: unknown): string {
  // Wallet rejection (comes from wallet-standard, not a SolanaError)
  if (err instanceof Error && err.message.includes("User rejected")) {
    return "Transaction was rejected by the wallet.";
  }

  // Anchor custom program errors — use the Codama-generated error messages
  if (
    isSolanaError(err, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM) &&
    typeof err.context?.code === "number"
  ) {
    const marketError = PREDICTION_MARKET_ERROR_CODES[err.context.code];
    if (marketError !== undefined) {
      return getPredictionMarketErrorMessage(marketError);
    }
  }

  // For all other errors, kit's SolanaError already has readable messages.
  // Walk the cause chain to find the deepest message.
  const message = getDeepestMessage(err);
  return message.length > 200 ? `${message.slice(0, 200)}...` : message;
}

function getDeepestMessage(err: unknown): string {
  let deepest = err instanceof Error ? err.message : String(err);
  let current: unknown = err;

  while (current instanceof Error && current.cause) {
    current = current.cause;
    if (current instanceof Error) {
      deepest = current.message;
    }
  }

  return deepest;
}
