import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { UserPlayHistory } from "@user/entities";
import { UserPlayHistoryRepository } from "@user/repositories";
import { VideoCompactDto } from "@youtube/dtos";
import { VideoRepository } from "@youtube/repositories";

import {
  GetMostPlayedParamSchema,
  GetMostPlayedQuery,
  GetMostPlayedResult,
} from "./get-most-played.query";

@QueryHandler(GetMostPlayedQuery)
export class GetMostPlayedHandler implements IInferredQueryHandler<GetMostPlayedQuery> {
  constructor(
    private readonly repository: UserPlayHistoryRepository,
    private readonly queueRepository: QueueRepository,
    private readonly videoRepository: VideoRepository,
  ) {}

  @ValidateParams(GetMostPlayedParamSchema)
  public async execute(params: GetMostPlayedQuery): Promise<GetMostPlayedResult> {
    const queue = this.queueRepository.getByUserId(params.executor.id);
    if (params.userId && params.userId !== params.executor.id) {
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.hasMember(params.userId)) throw new ForbiddenException("Missing permissions");
    }
    if ((params.guild || params.voiceChannel) && !queue) {
      throw new NotFoundException("Queue not found");
    }

    const from = new Date();
    from.setDate(from.getDate() - params.days);
    const options = {
      count: params.count,
      from,
    };

    let histories: UserPlayHistory[] = [];

    if (params.userId)
      histories = await this.repository.getMostPlayedByUserId(params.userId, options);
    else if (params.guild && queue)
      histories = await this.repository.getMostPlayedByGuildId(queue.guildId, options);
    else if (params.voiceChannel && queue)
      histories = await this.repository.getMostPlayedByVoiceChannelId(
        queue.voiceChannelId,
        options,
      );

    if (!histories.length) return [];

    const videos = await this.videoRepository.getByIds(histories.map((h) => h.videoId));
    videos.sort(
      (a, b) =>
        histories.findIndex((h) => h.videoId === a.id) -
        histories.findIndex((h) => h.videoId === b.id),
    );

    return videos.map(VideoCompactDto.create);
  }
}