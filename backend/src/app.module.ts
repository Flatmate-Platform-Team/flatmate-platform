import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { ProfilesController } from "./profiles/profiles.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AppController, AuthController, ProfilesController],
  providers: [AuthService],
})
export class AppModule {}
