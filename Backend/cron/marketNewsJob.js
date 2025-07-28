import cron from "node-cron";
import { fetchAndSaveNews } from "../services/News.service.js";

const scheduledTimes = ["0 8 * * *", "0 9 * * *", "0 12 * * *", "0 15 * * *", "0 17 * * *", "0 0 * * *"];
const GainerLossersTimes = [
  "15 9 * * *",
  "30 9 * * *",
  "45 9 * * *",
  "0 10 * * *",
  "15 10 * * *",
  "30 10 * * *",
  "45 10 * * *",
  "0 11 * * *",
  "15 11 * * *",
  "30 11 * * *",
  "45 11 * * *",
  "0 12 * * *",
  "15 12 * * *",
  "30 12 * * *",
  "45 12 * * *",
  "0 13 * * *",
  "15 13 * * *",
  "30 13 * * *",
  "45 13 * * *",
  "0 14 * * *",
  "15 14 * * *",
  "30 14 * * *",
  "45 14 * * *",
  "0 15 * * *",
  "15 15 * * *",
  "30 15 * * *"
];

scheduledTimes.forEach((schedule) => {
  cron.schedule(schedule, async () => {
    await fetchAndSaveNews();
  });
});

GainerLossersTimes.forEach((schedule) => {
  cron.schedule(schedule, async () => {
    await fetchAndSaveNews();
  });
});


