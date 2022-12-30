"use strict";
exports.__esModule = true;
var grammy_1 = require("grammy");
var axios_1 = require("axios");
require("dotenv").config();
var token = process.env.TELEGRAM_BOT_TOKEN || "";
var bot = new grammy_1.Bot(token);
bot.command("start", function (ctx) {
    ctx.reply("سوف أساعدك في البحث عن الأحاديث، والتأكد من صحتها. \n للبحث عن حديث اضغط /search");
});
bot.command("search", function (ctx) {
    ctx.reply("حسنًا، أرسل الحديث أو بعض الكلمات للبحث عنه");
});
bot.command("issue", function (ctx) {
    ctx.reply("سعيد بسماع رأيك، لو عندك مشكلة أو اقتراح @A7med3bdulBaset");
});
bot.on("message", function (ctx) {
    var message = ctx.message.text;
    var user = ctx.chat.id;
    bot.api.sendMessage(622497099, "Message: ".concat(message, " \nFrom: ").concat(user));
    bot.api.sendMessage(user, "جاري البحث عن الحديث...");
    axios_1["default"]
        .get("https://dorar.net/dorar_api.json?skey=".concat(message))
        .then(function (response) {
        var data = response.data.ahadith.result;
        if (data.startsWith("<br\/><br\/>\n<a href=\"https:\/\/dorar.net\/hadith\/search?q=")) {
            bot.api.sendMessage(user, "\u0644\u0645 \u0623\u062C\u062F \u062D\u062F\u064A\u062B\u0627 \u0641\u064A \u0643\u062A\u0628 \u0627\u0644\u0633\u0646\u0629 \u0641\u064A\u0647 \u0643\u0644\u0645\u0629 \"".concat(message, "\""));
            return;
        }
        var ahadithArrayWithHtmlMarkup = data.split("--------------");
        var ahadithObject = ahadithArrayWithHtmlMarkup.map(function (item) {
            return {
                text: (function () {
                    var stepOne = item.replace("<div class=\"hadith\" style=\"text-align:justify;\">", "");
                    var stepTwo = stepOne.slice(0, stepOne.indexOf("</div>"));
                    var stepThree = stepTwo
                        .split(/<[A-Za-z\s="->]*/g)
                        .join(" ");
                    return stepThree;
                })(),
                sahaby: (function () {
                    var stepOne = item.slice(item.indexOf("<span class=\"info-subtitle\">\u0627\u0644\u0631\u0627\u0648\u064A:</span>") + "<span class=\"info-subtitle\">\u0627\u0644\u0631\u0627\u0648\u064A:</span>".length);
                    var stepTwo = stepOne.slice(0, stepOne.indexOf("</span>"));
                    return stepTwo;
                })(),
                muhaddith: (function () {
                    var stepOne = item.slice(item.indexOf("<span class=\"info-subtitle\">\u0627\u0644\u0645\u062D\u062F\u062B:</span>") + "<span class=\"info-subtitle\">\u0627\u0644\u0645\u062D\u062F\u062B:</span>".length);
                    var stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                book: (function () {
                    var stepOne = item.slice(item.indexOf("<span class=\"info-subtitle\">\u0627\u0644\u0645\u0635\u062F\u0631:</span>") + "<span class=\"info-subtitle\">\u0627\u0644\u0645\u0635\u062F\u0631:</span>".length);
                    var stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                page: (function () {
                    var stepOne = item.slice(item.indexOf("<span class=\"info-subtitle\">\u0627\u0644\u0635\u0641\u062D\u0629 \u0623\u0648 \u0627\u0644\u0631\u0642\u0645:</span>") +
                        "<span class=\"info-subtitle\">\u0627\u0644\u0635\u0641\u062D\u0629 \u0623\u0648 \u0627\u0644\u0631\u0642\u0645:</span>"
                            .length);
                    var stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
                    return stepTwo;
                })(),
                hokm: (function () {
                    var stepOne = item.slice(item.indexOf("<span class=\"info-subtitle\">\u062E\u0644\u0627\u0635\u0629 \u062D\u0643\u0645 \u0627\u0644\u0645\u062D\u062F\u062B:</span>") +
                        "<span class=\"info-subtitle\">\u062E\u0644\u0627\u0635\u0629 \u062D\u0643\u0645 \u0627\u0644\u0645\u062D\u062F\u062B:</span>"
                            .length);
                    var stepTwo = item.slice(item.indexOf("<span >") + "<span >".length);
                    var stepThree = stepTwo.slice(0, stepTwo.indexOf("</span>"));
                    return stepThree;
                })()
            };
        });
        var ahadith = ahadithObject.map(function (hadith) {
            return "\n\u0627\u0644\u062D\u062F\u064A\u062B: ".concat(hadith.text.slice(4), ".\n\n\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\n\u062D\u0643\u0645 \u0627\u0644\u062D\u062F\u064A\u062B: ").concat(hadith.hokm.trim(), ".\n\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\n\u0627\u0644\u0631\u0627\u0648\u064A: ").concat(hadith.sahaby.trim(), ".\n\u0627\u0644\u0643\u062A\u0627\u0628: ").concat(hadith.book.trim(), ".\n\u0627\u0644\u0645\u062D\u062F\u062B: ").concat(hadith.muhaddith.trim(), ".\n\u0627\u0644\u0635\u0641\u062D\u0629: ").concat(hadith.page.trim(), "\n\n            ");
        });
        bot.api.sendMessage(user, ahadith[0]);
        setTimeout(function () {
            bot.api.sendMessage(user, ahadith[1]);
        }, 1000);
        setTimeout(function () {
            bot.api.sendMessage(user, ahadith[1]);
        }, 2000);
    })["catch"](function (err) {
        bot.api.sendMessage(user, "err");
    });
});
bot["catch"](function (err) {
    var ctx = err.ctx;
    bot.api.sendMessage(622497099, "Error while handling update: \n".concat(ctx.update.update_id));
    console.log(622497099, "Error while handling update: \n".concat(ctx.update.update_id));
    var e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        bot.api.sendMessage(622497099, "Error in request: \n".concat(e.description));
        console.log(622497099, "Error in request: \n".concat(e.description));
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
        bot.api.sendMessage(622497099, "Could not contact Telegram: \n".concat(e));
        console.log(622497099, "Could not contact Telegram: \n".concat(e));
    }
    else {
        bot.api.sendMessage(622497099, "Unknown error: \n".concat(e));
        console.log(622497099, "Unknown error: \n".concat(e));
    }
});
bot.start();
