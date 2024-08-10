// controllers are used to define function, which can also be defined in the routes
// the functions defined in controllers are used in routes, and routes are used in the main file


import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs'; 
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password,10);// 10 number of rounds for the salt
    const newUser = new User({ username, email, password:hashedPassword });
    try {
        await newUser.save() //wait until we recieve promise
        res.status(201).json({ message: "User registered succesfully" });
    } catch (error) {
        next(error);
    }
};