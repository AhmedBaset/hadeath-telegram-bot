import { Bot } from "grammy";
import axios from "axios";

require('dotenv').config()

const token = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new Bot(token);

//
bot.command("start", (ctx) => {
	ctx.reply(
		"سوف أساعدك في البحث عن الأحاديث، والتأكد من صحتها. \n للبحث عن حديث اضغط /search"
	);
});

bot.command("search", (ctx) => {
	ctx.reply("حسنًا، أرسل الحديث أو بعض الكلمات للبحث عنه");
});

bot.on("message", (ctx) => {
	const message = ctx.message.text; // Message object
	const user = ctx.chat.id;
	bot.api.sendMessage(622497099, `Message: ${message} \nFrom: ${user}`)

	bot.api.sendMessage(user, "جاري البحث عن الحديث...");

	axios
		.get(`https://dorar.net/dorar_api.json?skey=${message}`)
		.then((response) => {
			const data: string = response.data.ahadith.result;

			const ahadithArrayWithHtmlMarkup = data.split("--------------");

			const ahadithObject = ahadithArrayWithHtmlMarkup.map((item) => {
				return {
					text: (() => {
						const stepOne = item.replace(
							`<div class="hadith" style="text-align:justify;">`,
							""
						);
						const stepTwo = stepOne.slice(0, stepOne.indexOf("</div>"));
						const stepThree = stepTwo.split(/<[A-Za-z\s="->]*/g).join(" ");
						return stepThree;
					})(),
					sahaby: (() => {
						const stepOne = item.slice(
							item.indexOf(
								`<span class="info-subtitle">الراوي:</span>`
							) + `<span class="info-subtitle">الراوي:</span>`.length
						);
						const stepTwo = stepOne.slice(0, stepOne.indexOf("</span>"));
						return stepTwo;
					})(),
					muhaddith: (() => {
						const stepOne = item.slice(
							item.indexOf(
								`<span class="info-subtitle">المحدث:</span>`
							) + `<span class="info-subtitle">المحدث:</span>`.length
						);
						const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
						return stepTwo;
					})(),
					book: (() => {
						const stepOne = item.slice(
							item.indexOf(
								`<span class="info-subtitle">المصدر:</span>`
							) + `<span class="info-subtitle">المصدر:</span>`.length
						);
						const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
						return stepTwo;
					})(),
					page: (() => {
						const stepOne = item.slice(
							item.indexOf(
								`<span class="info-subtitle">الصفحة أو الرقم:</span>`
							) +
								`<span class="info-subtitle">الصفحة أو الرقم:</span>`
									.length
						);
						const stepTwo = stepOne.slice(0, stepOne.indexOf("<span"));
						return stepTwo;
					})(),
					hokm: (() => {
						const stepOne = item.slice(
							item.indexOf(
								`<span class="info-subtitle">خلاصة حكم المحدث:</span>`
							) +
								`<span class="info-subtitle">خلاصة حكم المحدث:</span>`
									.length
						);
						const stepTwo = item.slice(
							item.indexOf(`<span >`) + `<span >`.length
						);
						const stepThree = stepTwo.slice(
							0,
							stepTwo.indexOf("</span>")
						);
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
		})
		.catch((err) => {
			bot.api.sendMessage(user, "err");
		});
});


bot.catch(err => {
	const message: any = err.error
	bot.api.sendMessage(622497099, `Error: ${message.description}`)
})





bot.start();