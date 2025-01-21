import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getStream from "./llm/getStream";
import telegramifyMarkdown from 'telegramify-markdown';

// Replace 'YOUR_BOT_TOKEN' with the token you got from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your AI assistant. Send me a message and I will respond.');
});

// Helper function to escape special characters for MarkdownV2
function escapeMarkdown(text: string): string {
  // Characters that need to be escaped in MarkdownV2
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  let escapedText = text;
  specialChars.forEach(char => {
    escapedText = escapedText.replace(new RegExp('\\' + char, 'g'), '\\' + char);
  });
  return escapedText;
}

// Handle all other messages
bot.on('message', async (msg) => {
  // Ignore commands
  if (msg.text?.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  
  try {
    // Show "typing" status while processing
    bot.sendChatAction(chatId, 'typing');
    const response = await getStream(msg.text || '', msg.from.id.toString());
    const formattedResponse = telegramifyMarkdown(response, 'keep');
    bot.sendMessage(chatId, formattedResponse, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, 'Sorry, I encountered an error processing your message\\.', { parse_mode: 'MarkdownV2' });
  }
});

console.log('Telegram bot is running...');
