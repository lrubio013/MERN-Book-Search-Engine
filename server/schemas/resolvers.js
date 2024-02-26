// Basic setup for resolvers
const { signToken } = require("../utils/auth");
const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const data = await User.findOne({_id: context.user._id }).select("__V -passwrd");
                return data;
            }

            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push:{ savedBooks: newBook }},
                    { new: true }
                );
                return updatedUser;
            }
            throw AuthenticationError
        },
        removeBook: async (parent, { bookId}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull:{ savedBooks: { bookId } }},
                    { new: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers
