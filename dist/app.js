import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";
const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.TELEGRAM_BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3030;
app.use(express.json());

app.post(Number(PORT), (req, res) => { 
console.log(req.body);  
res.status(200).send('ok'); 
})


app.use(`/${secretPath}`, webhookCallback(bot, "express"));
app.listen(Number(process.env.PORT), async () => {
    await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
