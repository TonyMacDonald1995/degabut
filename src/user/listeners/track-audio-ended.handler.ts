import { TrackAudioEndedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserPlayHistory } from "@user/entities";
import { UserPlayHistoryRepository } from "@user/repositories";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedHandler implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly userPlayHistoryRepository: UserPlayHistoryRepository) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    const userId = track.requestedBy.id;
    const isUserInVoice = track.queue.voiceChannel.members.some((m) => m.id === userId);
    if (!isUserInVoice) return;

    await this.userPlayHistoryRepository.insert(
      new UserPlayHistory({
        playedAt: new Date(),
        userId,
        guildId: track.queue.guildId,
        voiceChannelId: track.queue.voiceChannelId,
        videoId: track.video.id,
      }),
    );
  }
}
