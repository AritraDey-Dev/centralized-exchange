import { Request, Response } from "express";
import { signInSchema } from "@repo/schema";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signInHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = signInSchema.safeParse(req.body);
        if (!user.success) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
        });
        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

