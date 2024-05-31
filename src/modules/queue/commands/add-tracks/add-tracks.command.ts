import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";
import * as Joi from "joi";

export type AddTracksResult = string[];

export class AddTracksCommand extends Command<AddTracksResult> implements IWithExecutor {
  public readonly playlistId?: string;
  public readonly youtubePlaylistId?: string;
  public readonly spotifyPlaylistId?: string;
  public readonly spotifyAlbumId?: string;
  public readonly lastLikedCount?: string;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: AddTracksCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTracksParamSchema = Joi.object<AddTracksCommand>({
  playlistId: Joi.string(),
  youtubePlaylistId: Joi.string(),
  spotifyPlaylistId: Joi.string(),
  spotifyAlbumId: Joi.string(),
  lastLikedCount: Joi.number().min(1).max(MAX_QUEUE_TRACKS),
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
})
  .required()
  .xor("playlistId", "youtubePlaylistId", "spotifyPlaylistId", "spotifyAlbumId", "lastLikedCount");