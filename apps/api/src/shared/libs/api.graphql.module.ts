import { GRAPHQL_CONFIG } from "@app/shared";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: GRAPHQL_CONFIG.playground ? { settings: { "request.credentials": "include" } } : false,
      path: GRAPHQL_CONFIG.path,
      sortSchema: false,
      autoSchemaFile: "schema.gql",
      buildSchemaOptions: { dateScalarMode: "isoDate" },
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      includeStacktraceInErrorResponses: false,
      formatError: (formttedError, error) => {
        // console.log('formatedError', formttedError);
        // console.log('error', error);
        return formttedError;
      },
    }),
  ],
})
export class ApiGraphqlModule {}
