import { ValidateParams } from "@common/decorators";
import { PlayerDestroyReason, QueuePlayerService } from "@discord-bot/services";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";

import { StopCommand, StopParamSchema } from "./stop.command";

@CommandHandler(StopCommand)
export class StopHandler implements IInferredCommandHandler<StopCommand> {
  constructor(private readonly playerService: QueuePlayerService) {}

  @ValidateParams(StopParamSchema)
  public async execute(params: StopCommand): Promise<void> {
    this.playerService.destroyPlayer(params.voiceChannelId, PlayerDestroyReason.COMMAND);
  }
}
