import { Module } from "@nestjs/common";
import { DiscoveryModule } from "../discovery";
import { ResourceDiscoveryService } from "./resource-discovery.service";

@Module({
  imports: [DiscoveryModule],
  providers: [ResourceDiscoveryService],
  exports: [ResourceDiscoveryService],
})
export class ResourceDiscoveryModule {
  static forRoot() {
    return {
      global: true,
      module: ResourceDiscoveryModule,
    };
  }
}
