
import { GraphQLScalarType,GraphQLError } from "graphql";
import validator from "validator";

const URLType = new GraphQLScalarType({
  name: "URL",
  description: "A well-formed URL string.",
  parseValue: value => {
    if (validator.isURL(value)) {
      return value;
    }
    throw new GraphQLError("String must be a valid URL including a protocol",{
      extensions:{
        code:"INVALID_URL"
      }
    });
  },
  serialize: value => {
    if (validator.isURL(value)) {
      return value;
    }
    throw new GraphQLError("String must be a valid URL including a protocol",{
      extensions:{
        code:"INVALID_URL"
      }
    });
  },
  parseLiteral: ast => {
    if (validator.isURL(ast.value)) {
      return ast.value;
    }
    throw new GraphQLError("String must be a valid URL including a protocol",{
      extensions:{
        code:"INVALID_URL"
        }
    });
  }
});

export default URLType;
