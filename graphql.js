// graphql.js

const { ApolloServer, gql } = require('apollo-server-lambda');

// Construct a schema, using GraphQL schema language
const fs = require('fs')
const typeDefs = fs.readFileSync('./schema.graphql',{encoding:'utf-8'})
const resolvers = require('./resolvers')
// ====================================================

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler();