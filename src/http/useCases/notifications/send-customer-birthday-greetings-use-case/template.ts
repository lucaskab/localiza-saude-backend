const DEFAULT_BIRTHDAY_SUBJECT_TEMPLATE = "Feliz aniversário, {{customerFirstName}}!";

const DEFAULT_BIRTHDAY_HTML_TEMPLATE = `
	<div style="background:linear-gradient(180deg,#f6fbfb 0%,#eef8f7 100%);padding:36px 16px;font-family:Inter,Arial,sans-serif;color:#17313b;">
		<div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dceceb;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(22,68,73,.10);">
			<div style="padding:36px 32px;background:linear-gradient(135deg,#1b847e 0%,#14635e 100%);color:#ffffff;text-align:center;">
				<div style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">{{appName}}</div>
				<h1 style="margin:16px 0 8px;font-size:34px;line-height:1.1;">Feliz aniversário!</h1>
				<p style="margin:0;font-size:16px;line-height:1.7;opacity:.92;">Que seu novo ciclo venha com mais saúde, leveza e bons encontros.</p>
			</div>
			<div style="padding:36px 32px;">
				<p style="margin:0 0 16px;font-size:17px;line-height:1.75;">Olá, <strong>{{customerName}}</strong>.</p>
				<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#49606b;">
					Hoje é um dia especial, e <strong>{{providerName}}</strong> quis passar aqui para desejar um aniversário bonito, sereno e cheio de motivos para sorrir.
				</p>
				<div style="margin:28px 0;padding:22px 24px;border-radius:22px;background:#f4fbfa;border:1px solid #d8ece8;">
					<p style="margin:0;font-size:16px;line-height:1.85;color:#17313b;">
						Que este novo ano da sua vida seja acompanhado de bem-estar, carinho nas relações e muito cuidado com você.
					</p>
				</div>
				<p style="margin:0;font-size:15px;line-height:1.8;color:#6a7d86;">
					Com carinho,<br />
					<strong>{{providerName}}</strong>
				</p>
			</div>
		</div>
	</div>
`.trim();

type BirthdayTemplateVariables = {
	customerName: string;
	customerFirstName: string;
	providerName: string;
	appName: string;
};

const templateTokenPattern = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

export function renderBirthdayTemplate(
	template: string,
	variables: BirthdayTemplateVariables,
) {
	return template.replace(templateTokenPattern, (_, token: string) => {
		if (token in variables) {
			return variables[token as keyof BirthdayTemplateVariables];
		}

		return `{{${token}}}`;
	});
}

export function stripHtmlToText(html: string) {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/\s+([,.;!?])/g, "$1")
		.replace(/\s+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

export function buildBirthdayGreetingMessage(params: {
	customerName: string;
	customerFirstName: string;
	providerName: string;
	subjectTemplate?: string | null;
	htmlTemplate?: string | null;
}) {
	const variables: BirthdayTemplateVariables = {
		customerName: params.customerName,
		customerFirstName: params.customerFirstName,
		providerName: params.providerName,
		appName: "Localiza Saúde",
	};

	const subject = renderBirthdayTemplate(
		params.subjectTemplate?.trim() || DEFAULT_BIRTHDAY_SUBJECT_TEMPLATE,
		variables,
	);
	const html = renderBirthdayTemplate(
		params.htmlTemplate?.trim() || DEFAULT_BIRTHDAY_HTML_TEMPLATE,
		variables,
	);

	return {
		subject,
		html,
		text: stripHtmlToText(html),
	};
}

export const birthdayEmailTemplateDefaults = {
	subject: DEFAULT_BIRTHDAY_SUBJECT_TEMPLATE,
	html: DEFAULT_BIRTHDAY_HTML_TEMPLATE,
};
