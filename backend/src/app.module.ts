import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { ProfilesController } from "./profiles/profiles.controller";
import { ListingsController } from "./listings/listings.controller";
import { DiscoveryController, MatchesController } from "./discovery/discovery.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AppController, AuthController, ProfilesController, ListingsController, DiscoveryController, MatchesController],
  providers: [AuthService],
})
export class AppModule {}
