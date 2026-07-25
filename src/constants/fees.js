// Must match Backend/config/wallet.php `fees.wallet_to_wallet` / `fees.account_to_account`.
// Used only to preview the fee live while the user is entering an amount —
// the backend is always the source of truth for the actual fee charged.
export const PEER_TRANSFER_FEE_RATE = 0.01;
