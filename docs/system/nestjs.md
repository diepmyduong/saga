# Service

```typescript
@Module({
  imports: [],
  providers: [HieuService, TayCuaHieuService],
  controllers: [],
  exports: [TayCuaHieuService],
})
class HieuModule {}
```

## Khai báo service cho Module Hiếu

```typescript
@Injectable()
class HieuService implements OnModuleInit {
  constructor(private readonly tayCuaHieuService: TayCuaHieuService) {}

  uong_nuoc(): string {
    return this.tayCuaHieuService.uong_nuoc();
  }

  async onModuleInit() {}
}

@Injectable()
class TayCuaHieuService {
  uong_nuoc(): string {
    return "Uong nuoc";
  }
}
```

# Decorator

## Args decorator

```typescript
@ArgsType()
class HelloArgs {
  @Field()
  name: string;

  @Field()
  age: number;
}

class Resolver {
  @Query((returns) => String)
  async hello(@Args("name") name: string, @Args("age") age: number): Promise<string> {
    return `Hello ${name} ${age}`;
  }
  async hello2(@Args() options: HelloArgs): Promise<string> {
    return `Hello ${options.name} ${options.age}`;
  }
}
```
