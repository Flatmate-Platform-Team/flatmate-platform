import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  status() {
    return {
      name: "Flatmate Platform API",
      status: "starter",
      todo: "Feature modules not implemented yet",
    };
  }
}
