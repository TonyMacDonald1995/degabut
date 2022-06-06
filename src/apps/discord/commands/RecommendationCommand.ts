import {
	GetRecommendationAdapter,
	GetRecommendationUseCase,
} from "@modules/user/useCases/GetRecommendationUseCase";
import { ArrayUtils, DiscordUtils } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";
import { SearchInteractionCommand } from "../interactions/SearchInteractionCommand";

@injectable()
export class RecommendationCommand implements ICommand {
	public readonly name = "recommend";
	public readonly aliases = ["recommendation", "recommendations"];
	public readonly description = "Show songs recommendation";

	constructor(
		@inject(GetRecommendationUseCase)
		private getRecommendation: GetRecommendationUseCase,
		@inject(SearchInteractionCommand)
		private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<unknown> {
		const adapter = new GetRecommendationAdapter({ lastPlayedCount: 5, mostPlayedCount: 5 });

		const userId = message.mentions.users.first()?.id || message.author.id;
		const { lastPlayed, mostPlayed } = await this.getRecommendation.execute(adapter, { userId });

		const filteredLastPlayed = ArrayUtils.shuffle(lastPlayed).filter(
			(v) => !mostPlayed.find((l) => l.id === v.id)
		);
		const slicedMostPlayed = ArrayUtils.shuffle(
			mostPlayed.slice(0, Math.max(7, 10 - filteredLastPlayed.length))
		);
		const slicedLastPlayed = filteredLastPlayed.slice(0, 10 - slicedMostPlayed.length);

		const videos = [...slicedLastPlayed, ...slicedMostPlayed];
		if (!videos.length) return await message.reply("No recommendation found");

		const buttons = videos.map((v, i) =>
			DiscordUtils.videoToMessageButton(v, i, this.searchInteractionCommand.name)
		);

		const components = [new MessageActionRow({ components: buttons.slice(0, 5) })];
		if (buttons.length > 5)
			components.push(new MessageActionRow({ components: buttons.slice(5, 10) }));

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(DiscordUtils.videoToEmbedField) })],
			components,
		});
	}
}
