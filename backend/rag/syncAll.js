import { syncAllExpensesToChroma } from "./sync.js";

try {
  await syncAllExpensesToChroma();
  console.log("Chroma sync completed successfully.");
  process.exit(0);
} catch (error) {
  console.error("Chroma sync failed:", error);
  process.exit(1);
}