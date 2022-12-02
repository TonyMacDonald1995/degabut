import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerTickEvent } from "@queue-player/events";

@EventsHandler(PlayerTickEvent)
export class PlayerTickHandler implements IEventHandler<PlayerTickEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ player }: PlayerTickEvent): Promise<void> {
    const memberIds = player.voiceChannel.members.map((m) => m.id);
    this.gateway.send(memberIds, "player-tick", { position: player.audioPlayer.position });
  }
}
