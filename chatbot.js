const TelegramBot = require("node-telegram-bot-api");
const token = "6218044641:AAH2Yt1rwnslf6oIYxCd8HxJbgupAOLynyU";
const bot = new TelegramBot(token, { polling: true });
const axios = require("axios");

// Create a new product
bot.onText(/\/create (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productData = match[1].split(",");

  const [name, description, price, quantity] = productData;

  try {
    const response = await axios.post("http://localhost:3000/products", {
      name,
      description,
      price,
      quantity,
    });

    bot.sendMessage(chatId, "New product created!");
  } catch (error) {
    bot.sendMessage(chatId, "Failed to create product.");
  }
});

// Read all products
bot.onText(/\/readall/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get("http://localhost:3000/products");
    const products = response.data;

    if (products.length === 0) {
      bot.sendMessage(chatId, "No products found.");
    } else {
      let response = "";
      for (const product of products) {
        response += `Product ID: ${product.id}\nName: ${product.name}\nDescription: ${product.description}\nPrice: ${product.price}\nQuantity: ${product.quantity}\n\n`;
      }
      bot.sendMessage(chatId, response);
    }
  } catch (error) {
    bot.sendMessage(chatId, "Failed to retrieve products.");
  }
});

// Search products by name
bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productName = match[1];

  try {
    const response = await axios.get(
      `http://localhost:3000/products?name=${encodeURIComponent(productName)}`,
    );

    const products = response.data;

    if (products.length === 0) {
      bot.sendMessage(chatId, "No products found.");
    } else {
      let response = "";
      for (const product of products) {
        response += `Product ID: ${product.id}\nName: ${product.name}\nDescription: ${product.description}\n\n`;
      }
      bot.sendMessage(chatId, response);
    }
  } catch (error) {
    bot.sendMessage(chatId, "Failed to search products.");
    console.log(error);
  }
});

// Update a product
bot.onText(/\/update (\d+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const productId = parseInt(match[1]);
  const newDetails = match[2].split(",").map((detail) => detail.trim());

  const productUpdate = {
    name: newDetails[0],
    description: newDetails[1],
    price: parseFloat(newDetails[2]),
    quantity: parseInt(newDetails[3]),
  };

  axios
    .put(`http://localhost:3000/products/${productId}`, productUpdate)
    .then((response) => {
      bot.sendMessage(chatId, `Product with ID ${productId} updated.`);
    })
    .catch((error) => {
      bot.sendMessage(chatId, "Failed to update product.");
    });
});

// Delete a product
bot.onText(/\/delete (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productId = parseInt(match[1]);

  try {
    const response = await axios.delete(
      `http://localhost:3000/products/${productId}`,
    );

    bot.sendMessage(chatId, `Product with ID ${productId} deleted.`);
  } catch (error) {
    bot.sendMessage(chatId, "Failed to delete product.");
  }
});

// Clear all chat messages
bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;

  bot
    .getChat(chatId)
    .then((chat) => {
      const lastMessageId = chat.last_message_id;

      for (let i = 0; i <= lastMessageId; i++) {
        bot.deleteMessage(chatId, i.toString()).catch((error) => {
          console.log("Failed to delete message:", error);
        });
      }

      bot.sendMessage(chatId, "All chat messages cleared.");
    })
    .catch((error) => {
      console.log("Failed to get chat information:", error);
      bot.sendMessage(chatId, "Failed to clear chat messages.");
    });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `Welcome to the Product Bot!\n\nAvailable commands:\n
  /create [name, description, price, quantity] - Create a new product\n
  /readall - Read all products\n
  /update [id] - Update a product\n
  /delete [id] - Delete a product\n
  /search [name] - Search products by name\n
  /clear - Clear all chat messages\n
  /help - Show this help message`;

  bot.sendMessage(chatId, helpMessage);
});

// Handle unsupported commands and greet user
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const greetMessage = `Hi there! Welcome to ThriftHive\n\nTo view available commands, type /help.`;

  bot.sendMessage(chatId, greetMessage);
});
