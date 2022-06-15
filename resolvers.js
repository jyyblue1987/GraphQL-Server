const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const JWT_SECRET = '12321312321a';

const db = require('./db')
const Query = {
    greeting: () => {
        return "Hello, How are you?"
    },
    students: () => db.students.list(),

    //resolver function for studentbyId
    studentById: (root, args, context, info) => {
        //args will contain parameter passed in query
        return db.students.get(args.id);
    },
    sayHello: (root, args, context, info) => `Hi ${args.name} GraphQL server says Hello to you!!`,
    setFavouriteColor: (root, args) => {
        return "Your Fav Color is :" + args.color;
    },
    // fetch the profile of currently authenticated user
    async me(_, args, { user }) {
        // make sure user is logged in
        if (!user) {
            throw new Error('You are not authenticated!')
        }

        // user is authenticated
        return db.students.get(user.id);
    }
}

const Student = {
    fullName: (root, args, context, info) => {
        return root.firstName + ":" + root.lastName
    },
    college: (root) => {
        return db.colleges.get(root.collegeId);
    }
}

const Mutation = {
    createStudent: (root, args, context, info) => {
        return db.students.create({
            collegeId: args.collegeId,
            firstName: args.firstName,
            lastName: args.lastName
        })
    },

    // new resolver function
    addStudent_returns_object: (root, args, context, info) => {
        const id = db.students.create({
            collegeId: args.collegeId,
            firstName: args.firstName,
            lastName: args.lastName
        })

        return db.students.get(id)
    },

    signUp: async (root, args, context, info) => {

        const { email, firstName, password } = args.input;

        const emailExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        const isValidEmail = emailExpression.test(String(email).toLowerCase())
        if (!isValidEmail)
            throw new Error("email not in proper format")

        if (firstName.length > 15)
            throw new Error("firstName should be less than 15 characters")

        if (password.length < 8)
            throw new Error("password should be minimum 8 characters")

        const id = db.students.create({
            email: email,
            firstName: firstName,
            password: await bcrypt.hash(password, 10)
        })

        // // return json web token
        return jsonwebtoken.sign(
            { id: id, email: email },
            JWT_SECRET,
            { algorithm: 'HS256' }
        )
    },

    login: async (root, args, context, info) => {

        const { email, password } = args;

        const user = db.students.list().find(row => row.email == email);

        if (!user) {
            throw new Error('No user with that email')
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new Error('Incorrect password')
        }

        return jsonwebtoken.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { algorithm: 'HS256' }
        )
    },
}

module.exports = { Query, Student, Mutation }