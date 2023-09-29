
import { GraphQLScalarType,GraphQLError } from "graphql";
import validator from "validator";

const DateTimeType = new GraphQLScalarType({
  name: "DateTime",
  description: "An ISO 8601-encoded UTC date string.",
  parseValue: value => {
    if (validator.isISO8601(value)) {
      return value;
    }
    throw new GraphQLError("DateTime must be a valid ISO 8601 Date string",{
      extensions:{
        code:"INVALID_DATE_TIME_FORMAT",
      }
    });
  },
  serialize: value => {
    if (typeof value !== "string") {
      value = value.toISOString();
    }

    if (validator.isISO8601(value)) {
      return value;
    }
    throw new GraphQLError("DateTime must be a valid ISO 8601 Date string",{
      extensions:{
        code:"INVALID_DATE_TIME_FORMAT",
        }
    });
  },
  parseLiteral: ast => {
    if (validator.isISO8601(ast.value)) {
      return ast.value;
    }
    throw new GraphQLError("DateTime must be a valid ISO 8601 Date string",{
      extensions:{
        code:"INVALID_DATE_TIME_FORMAT",
      }
    });
  }
});

export default DateTimeType;
