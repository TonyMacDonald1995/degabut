import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { JoinHandler } from "./join";
import { SeekHandler } from "./seek";
import { SetPauseHandler } from "./set-pause";
import { SkipHandler } from "./skip";
import { StopHandler } from "./stop";

export * from "./join";
export * from "./seek";
export * from "./set-pause/";
export * from "./skip";
export * from "./stop";

export const Commands: Constructor<ICommandHandler>[] = [
  JoinHandler,
  StopHandler,
  SkipHandler,
  SeekHandler,
  SetPauseHandler,
];
