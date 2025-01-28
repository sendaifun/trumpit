import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getStream from "./llm/getStream";
import telegramifyMarkdown from 'telegramify-markdown';
import { transfer } from './kit/tools/agent/transfer';
import { getWallet } from './client/wallet';
import { PublicKey } from '@solana/web3.js';

// Replace 'YOUR_BOT_TOKEN' with the token you got from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });
const start_message = `*Welcome fellow American, let's make America great again! 🎉*

I can assist you with the following tasks related to the *TRUMP* token and perpetual trading onchain:

*1.* Fetch the current price of the *TRUMP* token in *USDC* using the Jupiter API
*2.* Swap tokens (e.g., *SOL* to *TRUMP* or vice versa) using the Jupiter Exchange
*3.* Get information about *Donald Trump* and his memecoin *$TRUMP*
*4.* Get the wallet address of the agent
*5.* Check the balance of a Solana wallet or token account
*6.* Transfer balance to another wallet
Fallback command: \`/transfer <wallet_address> <amount>\`

If you need help with any of these tasks, just let me know! 🚀

*⚠️ Warning:* This bot is for entertainment purposes only.
*Trading cryptocurrencies involves substantial risk of loss.* Never invest more than you can afford to lose.
*Note:* Deepseek API may be slow sometimes, please be patient.
`;

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const imagePath = "https://i.imgur.com/nopBtcA.png";

  try {
    await bot.sendPhoto(chatId, imagePath, {
      caption: start_message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error sending start message with image:', error);
    bot.sendMessage(chatId, start_message, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/transfer/, async (msg) => {
  const chatId = msg.chat.id;
  const user_id = msg.from?.id?.toString() || '';
  const wallet = await getWallet(user_id); 
  const user_wallet = {
    user_id: user_id,
    wallet_address: new PublicKey(wallet.wallet_address),
  }
  const [cmd, to, amount] = msg.text?.split(" ") || [];
  try {
    const tx = await transfer(user_wallet, new PublicKey(to), Number(amount));
    let response = `Your transfer to \`${to}\` of \`${amount}\` TRUMP is completed successfully. President Trump is proud of you! 🇺🇸`;
    bot.sendMessage(chatId, telegramifyMarkdown(response, 'keep'), { parse_mode: 'MarkdownV2' });
  } catch (error: any) {
    bot.sendMessage(chatId, `Transfer failed, Please try again later or contact team if the issue persists`, { parse_mode: 'MarkdownV2' });
  }
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
    const response = await getStream(msg.text || '', msg?.from?.id?.toString() || '');
    const formattedResponse = telegramifyMarkdown(response, 'keep');
    bot.sendMessage(chatId, formattedResponse, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, 'Sorry, I encountered an error processing your message\\.', { parse_mode: 'MarkdownV2' });
  }
});

console.log('Telegram bot is running...');
