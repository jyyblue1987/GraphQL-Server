const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const jwt = require("jsonwebtoken");

// const db = require('./db');
const JWT_SECRET = '12321312321a';

const port = process.env.PORT || 9000;
const app = express();

// // auth middleware
// const auth = jwt({
//    secret: JWT_SECRET,
//    algorithms: ["HS256"],
//    credentialsRequired: false
// })



// Construct a schema, using GraphQL schema language
const fs = require('fs')
const typeDefs = fs.readFileSync('./schema.graphql', { encoding: 'utf-8' })
const resolvers = require('./resolvers')
// ====================================================


const { makeExecutableSchema } = require('graphql-tools')
const schema = makeExecutableSchema({ typeDefs, resolvers })

app.use(cors(), bodyParser.json());

const verifyToken = (req, res, next) => {
   // console.log(req)
   let token = req.headers["x-access-token"];
   if (!token) {
      next()
      return;
   }

   jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
         req.user = decoded
      }

      next();
   });
};

const { graphiqlExpress, graphqlExpress } = require('apollo-server-express')
app.use('/graphql', bodyParser.json(), verifyToken, graphqlExpress(req => ({
   schema,
   context: {
      user: req.user
   }
})))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(
   port, () => console.info(
      `Server started on port ${port}`
   )
);