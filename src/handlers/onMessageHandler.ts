import { Message } from "discord.js";
import { queues } from "../shared";

export const onMessage = async (message: Message): Promise<void> => {
	const client = message.client;
	const prefix = client.prefix;

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = (args.shift() as string).toLowerCase();
	const command = client.commands.find(
		(c) => c.name === commandName || c.aliases?.includes(commandName)
	);

	if (!command || command.enabled === false || !message.guild) return;

	const queue = queues.get(message.guild.id);

	try {
		if (command.middlewares) {
			const middlewares = Array.isArray(command.middlewares)
				? command.middlewares
				: [command.middlewares];

			for (const middleware of middlewares) await middleware(message);
		}

		await command.execute(message, args, queue);
	} catch (error) {
		await message.reply(`Failed to execute the command: ${(error as Error).message}`);
	}
};
