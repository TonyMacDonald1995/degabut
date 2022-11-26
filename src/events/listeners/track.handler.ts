import { TrackAudioStartedEvent } from "@discord-bot/events";
import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackDto } from "@queue/dtos";
import { QueueProcessedEvent } from "@queue/events";

const events = [TrackAudioStartedEvent, QueueProcessedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class TrackHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const track = event instanceof QueueProcessedEvent ? event.queue.nowPlaying : event.track;
    const queue = event instanceof QueueProcessedEvent ? event.queue : event.track.queue;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, track ? TrackDto.create(track) : null);
  }
}