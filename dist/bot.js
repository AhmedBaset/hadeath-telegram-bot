import { Bot, GrammyError, HttpError } from "grammy";
import axios from "axios";
require("dotenv").config();
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Bot(token);
bot.command("start", (ctx) => {
    ctx.reply("سوف أساعدك في البحث عن الأحاديث، والتأكد من صحتها. \n للبحث عن حديث اضغط /search");
});
bot.command("search", (ctx) => {
    ctx.reply("حسنًا، أرسل الحديث أو بعض الكلمات للبحث عنه");
});
bot.command("issue", (ctx) => {
    ctx.reply("سعيد بسماع رأيك، لو عندك مشكلة أو اقتراح @A7med3bdulBaset");
});
bot.on("message", (ctx) => {
    const message = ctx.message.text;
    const user = ctx.chat.id;
    bot.api.sendMessage(622497099, `Message: ${message} \nFrom: ${user}`);
    bot.api.sendMessage(user, "جاري البحث عن الحديث...");
    axios
        .get(`https://dorar.net/dorar_api.json?skey=${message}`)
        .then((response) => {
        const data = response.data.ahadith.result;
        if (data.startsWith("<br\/><br\/>\n<a href=\"https:\/\/dorar.net\/hadith\/search?q=")) {
            bot.api.sendMessage(user, `لم أجد حديثا في كتب السنة فيه كلمة "${message}"`);
            return;
        }
        const ahadithArrayWithHtmlMarkup = data.split("--------------");
        const ahadithObject = ahadithArrayWithHtmlMarkup.map((item) => {
            return {
                text: (() => {
                    const stepOne = item.replace(`<div class="hadith" style="text-align:justify;">`, "");
                    const stepTwo = stepOne.slice(0, stepOne.indexOf("</div>"));
                    const stepThree = stepTwo
                        .split(/<[A-Za-z\s="->]*/g)
                        .join(" ");
                    return stepThree;
                })(),
                sahaby: (() => {
                    const stepOne = item.slice(item.indexOf(`<span class="info-subtitle">الراوي:</span>`) + `<span class="info-subtitle">الراوي:</span>`.length);
                    const stepTwo = stepOne.slice(0, stepOne.indexOf("</span>"));
                    return stepTwo;
                })(),
                muhaddith: (() => {
                    const stepOne = item.slice(item.indexOf(`<span class="info-subtitle">المحدث:</span>`) + `<span class="info-subtitle">المحدث:</span>`.length);
                    const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                book: (() => {
                    const stepOne = item.slice(item.indexOf(`<span class="info-subtitle">المصدر:</span>`) + `<span class="info-subtitle">المصدر:</span>`.length);
                    const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                page: (() => {
                    const stepOne = item.slice(item.indexOf(`<span class="info-subtitle">الصفحة أو الرقم:</span>`) +
                        `<span class="info-subtitle">الصفحة أو الرقم:</span>`
                            .length);
                    const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                hokm: (() => {
                    const stepOne = item.slice(item.indexOf(`<span class="info-subtitle">خلاصة حكم المحدث:</span>`) +
                        `<span class="info-subtitle">خلاصة حكم المحدث:</span>`
                            .length);
                    const stepTwo = item.slice(item.indexOf(`<span >`) + `<span >`.length);
                    const stepThree = stepTwo.slice(0, stepTwo.indexOf("</span>"));
                    return stepThree;
                })(),
            };
        });
        const ahadith = ahadithObject.map((hadith) => {
            return `
الحديث: ${hadith.text.slice(4)}.

ـــــــــــــ
حكم الحديث: ${hadith.hokm.trim()}.
ـــــــــــــ
الراوي: ${hadith.sahaby.trim()}.
الكتاب: ${hadith.book.trim()}.
المحدث: ${hadith.muhaddith.trim()}.
الصفحة: ${hadith.page.trim()}

            `;
        });
        bot.api.sendMessage(user, ahadith[0]);
        setTimeout(() => {
            bot.api.sendMessage(user, ahadith[1]);
        }, 1000);
        setTimeout(() => {
            bot.api.sendMessage(user, ahadith[1]);
        }, 2000);
    })
        .catch((err) => {
        bot.api.sendMessage(user, "err");
    });
});
bot.catch((err) => {
    const ctx = err.ctx;
    bot.api.sendMessage(622497099, `Error while handling update: \n${ctx.update.update_id}`);
    console.log(622497099, `Error while handling update: \n${ctx.update.update_id}`);
    const e = err.error;
    if (e instanceof GrammyError) {
        bot.api.sendMessage(622497099, `Error in request: \n${e.description}`);
        console.log(622497099, `Error in request: \n${e.description}`);
    }
    else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
        bot.api.sendMessage(622497099, `Could not contact Telegram: \n${e}`);
        console.log(622497099, `Could not contact Telegram: \n${e}`);
    }
    else {
        bot.api.sendMessage(622497099, `Unknown error: \n${e}`);
        console.log(622497099, `Unknown error: \n${e}`);
    }
});
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
bot.start();
export { bot };
