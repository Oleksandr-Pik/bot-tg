const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options.js");
const User = require("./models.js");

const token = "7024061243:AAGnn1ZWQhv5nMUckWGlZiACI_T7ozBRvzc";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Зараз я загадаю цифру від 0 до 9, а ти повинен будеш ії відгадати"
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Відгадуй", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Стартове привітання" },
    { command: "/info", description: "Отримати інформацію про користувача" },
    { command: "/game", description: "Гра Відгадай цифру" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userName = msg.chat.first_name;

    try {
      if (text === "/start") {
        User.chatId = chatId; // Запит до БД
        console.log("User", User);
        await bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp"
        );
        return bot.sendMessage(
          chatId,
          `Ласкаво просимо в телеграм бот - MySuperbot`
        );
      }

      if (text === "/info") {
        // const user = await User.findOneById(chatId)
        return bot.sendMessage(chatId, `Твоє ім'я ${userName}, в грі в тебе правильних відповідей ${User.right}, неправильних відповідей ${User.wrong}`);
      }

      if (text === "/game") {
        return startGame(chatId);
      }
    } catch (error) {
      return bot.sendMessage(chatId, "Отакої, щось пішло не так ...");
    }

    return bot.sendMessage(chatId, `Я тебе не розумію, спробуй ще раз`);
  });

  bot.on("callback_query", (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    // const user = await User.findOneById(chatId)

    if (data === "/again") {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      User.right +=1;
      return bot.sendMessage(
        chatId,
        `Вітаю, ти відгадав цифру ${chats[chatId]}`,
        againOptions
      );
    } else {
      User.wrong +=1;
      return bot.sendMessage(
        chatId,
        `Нажаль ти не відгадав, бот загадав цифру ${chats[chatId]}`,
        againOptions
      );
    }
    // await user.save()
  });
};

start();
