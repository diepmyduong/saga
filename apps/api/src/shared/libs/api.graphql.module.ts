import { BaseException, GRAPHQL_CONFIG } from "@app/shared";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

function isDerivedFrom(child: any, parent: any): boolean {
  if (child === parent) return true;
  if (child == null) return false;
  return isDerivedFrom(Object.getPrototypeOf(child), parent);
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: GRAPHQL_CONFIG.playground ? { settings: { "request.credentials": "include" } } : false,
      path: GRAPHQL_CONFIG.path,
      sortSchema: false,
      autoSchemaFile: "schema.gql",
      buildSchemaOptions: { dateScalarMode: "isoDate" },
      includeStacktraceInErrorResponses: false,
      autoTransformHttpErrors: true,
      status400ForVariableCoercionErrors: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      formatError: (formttedError, error) => {
        if (error instanceof GraphQLError && error.originalError instanceof BaseException) {
          return {
            code: error.originalError.code,
            message: error.originalError.message,
            path: formttedError.path,
            httpCode: error.originalError.getStatus(),
          };
        } else {
          return {
            code: formttedError.extensions?.code || "INTERNAL_SERVER_ERROR",
            message: formttedError.message,
            path: formttedError.path,
            httpCode: 500,
          };
        }
      },
    }),
  ],
})
export class ApiGraphqlModule {}
