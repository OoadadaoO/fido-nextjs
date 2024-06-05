import cron from "node-cron";

import { recordAAGUIDs } from "./aaguid";

// Run every day at 00:00(UTC)
cron.schedule("0 0 * * *", async () => {
  await recordAAGUIDs();
  console.log("Finished recording AAGUIDs.");
});
