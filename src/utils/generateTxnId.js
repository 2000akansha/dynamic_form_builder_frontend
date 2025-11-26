export default function generateTxnId() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let txnId = '';
  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    txnId += characters[randomIndex];
  }
  return txnId;
}
