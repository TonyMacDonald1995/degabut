import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistVideo } from "@playlist/entities";
import { MAX_VIDEO_PER_PLAYLIST } from "@playlist/playlist.constant";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";
import { YoutubeiProvider } from "@youtube/providers";
import { ChannelRepository, VideoRepository } from "@youtube/repositories";

import {
  AddPlaylistVideoCommand,
  AddPlaylistVideoParamSchema,
  AddPlaylistVideoResult,
} from "./add-playlist-video.command";

@CommandHandler(AddPlaylistVideoCommand)
export class AddPlaylistVideoHandler implements IInferredCommandHandler<AddPlaylistVideoCommand> {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
    private readonly youtubeProvider: YoutubeiProvider,
  ) {}

  @ValidateParams(AddPlaylistVideoParamSchema)
  public async execute(params: AddPlaylistVideoCommand): Promise<AddPlaylistVideoResult> {
    const { videoId, playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    const count = await this.playlistVideoRepository.getCountByPlaylistId(playlistId);
    if (count >= MAX_VIDEO_PER_PLAYLIST) {
      throw new BadRequestException("Playlist video limit reached");
    }

    const video = await this.youtubeProvider.getVideo(videoId);
    if (!video) throw new BadRequestException("Video not found");

    const playlistVideo = new PlaylistVideo({
      videoId: video.id,
      playlistId,
      video,
      createdBy: executor.id,
    });

    await this.videoRepository.upsert(video);
    await Promise.all([
      video.channel && this.channelRepository.upsert(video.channel),
      this.playlistVideoRepository.insert(playlistVideo),
    ]);

    return playlistVideo.id;
  }
}