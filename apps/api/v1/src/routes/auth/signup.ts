import { Request, Response } from "express";
import { signUpSchema } from "@repo/schema";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUpHandler = async (req: Request, res: Response) => {
    const { email, password, username} = req.body;
    try {
        const user = signUpSchema.safeParse(req.body);
        if (!user.success) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                username: username,
            },
        });
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
        });
        return res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};