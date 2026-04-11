import "dotenv/config";
import { Telegraf } from "telegraf";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Copy .env.example to .env and set the token.");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) =>
  ctx.reply("Привет! Я бот проекта Study & Visit. Команды: /help"),
);
bot.help((ctx) =>
  ctx.reply("Доступные команды:\n/start — приветствие\n/help — эта справка"),
);
bot.on("text", (ctx) => ctx.reply(`Вы написали: ${ctx.message.text}`));

bot.catch((err, ctx) => {
  console.error("Bot error", err);
  if (ctx?.chat) {
    ctx.reply("Произошла ошибка, попробуйте позже.").catch(() => {});
  }
});

await bot.launch();
console.log("Telegram bot is running");

const stop = async (signal) => {
  await bot.stop(signal);
  process.exit(0);
};
process.once("SIGINT", () => void stop("SIGINT"));
process.once("SIGTERM", () => void stop("SIGTERM"));
