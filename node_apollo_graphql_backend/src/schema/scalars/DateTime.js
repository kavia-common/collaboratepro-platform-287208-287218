'use strict';

const { GraphQLScalarType, Kind } = require('graphql');

// PUBLIC_INTERFACE
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 DateTime scalar',
  serialize(value) {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  },
  parseValue(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid DateTime');
    }
    return date;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) return null;
    const date = new Date(ast.value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid DateTime');
    }
    return date;
  },
});

module.exports = DateTime;
