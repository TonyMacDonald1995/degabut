import { DiscordUtil } from "@common/utils";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueProcessedEvent } from "@queue/events";

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedHandler implements IEventHandler<QueueProcessedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ queue }: QueueProcessedEvent) {
    const player = this.playerRepository.getByGuildId(queue.guildId);
    if (!player) return;

    if (!queue.nowPlaying) player.audioPlayer.stop();
    else player.audioPlayer.play(DiscordUtil.createAudioSource(queue.nowPlaying));
  }
}
