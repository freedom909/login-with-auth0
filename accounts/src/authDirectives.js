import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { GraphQLError } from "graphql";
import { defaultFieldResolver } from "graphql";
import { getDirectives, MapperKind, mapSchema } from "@graphql-tools/utils";
import { get } from "lodash-es";
import { gql } from 'graphql-tag';
const __dirname = dirname(fileURLToPath(import.meta.url));

const authDirectivesTypeDefs = gql`
  directive @private on FIELD_DEFINITION
  directive @owner(argumentName: String) on FIELD_DEFINITION
  directive @scope(permissions: [String]) on FIELD_DEFINITION
`;

function applyAuthDirectives(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: fieldConfig => {
      const fieldDirectives = getDirectives(schema, fieldConfig);
      const privateDirective = fieldDirectives.find(
        dir => dir.name === "private"
      );
      const ownerDirective = fieldDirectives.find(
        dir => dir.name === "owner"
      );
      const scopeDirective = fieldDirectives.find(
        dir => dir.name === "scope"
      );

      const { resolve = defaultFieldResolver } = fieldConfig;

      if (privateDirective || ownerDirective || scopeDirective) {
        fieldConfig.resolve = function (source, args, context, info) {
          const privateAuthorized = privateDirective && context.user?.sub;
          const ownerArgAuthorized =
            ownerDirective &&
            context.user?.sub &&
            get(args, ownerDirective.args.argumentName) === context.user.sub;

          let scopeAuthorized = false;
          if (scopeDirective && context.user?.scope) {
            const tokenPermissions = context.user.scope.split(" ");
            scopeAuthorized = scopeDirective.args.permissions.every(scope =>
              tokenPermissions.includes(scope)
            );
          }

          if (
            (privateDirective && !privateAuthorized) ||
            (ownerDirective && !ownerArgAuthorized) ||
            (scopeDirective && !scopeAuthorized)
          ) {
            throw new GraphQLError("Not authorized!", {
              extensions: {
                code: "AUTH_ERROR",
                permissions: scopeDirective?.args.permissions,
              },
            });
          }

          return resolve(source, args, context, info);
        };

        return fieldConfig;
      }
    },
  });
}

export { authDirectivesTypeDefs, applyAuthDirectives };
