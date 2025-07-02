import { Request, Response, Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken'
import { userModel, contentModel, linkModel } from '../db'
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { UserMiddleware } from '../middleware';
import { random } from '../utils'

const userRouter = Router();

userRouter.post('/signup', async (req: Request,res:Response) => {
    const { username, password} = req.body;

    // validate the request body via zod
    const userSchema = z.object({
        username: z.string().min(1, { message: "Please Enter your username" }).max(20, { message: "Username must not exceed 20 characters" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(20, { message: "Password must not exceed 20 characters" }).regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[\W_]/, "Password must contain at least one special character"),
    })

    const { success, error } = userSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({
            message: error.issues[0].message
        })

        return;
    }
    // hash the password via bcrypt
    const hashedPassword = await bcrypt.hash(password, 8);

    try {
        await userModel.create({
            password: hashedPassword,
            username: username
        })

        const findUser = await userModel.findOne({
            username:username
        })

        const Token = jwt.sign({
            token: findUser?._id
        }, process.env.JWT_USER_SECRET as string,{
            expiresIn: "7d",
          })

        res.json({
            message: "successfully signed up",
            token: Token
        })

    } catch (error) {
        res.json({
            message: error
        })
    }
})

//@ts-ignore
userRouter.post("/signin", async(req: Request, res: Response ) => {

    const { username, password } = req.body;

    // just logging the request body values from API testing via POSTMAN
    console.log("Sign-in attempt for username:", username);
    console.log("Received userPassword (should be plain text):", password);

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required and must be a string." });
    }
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: "Password is required and must be a string." });
    }

    const findUser = await userModel.findOne({ username: username });

    if (!findUser) {
        return res.status(411).json({
            message: "Enter a valid email address" 
        });
    }

    // Find the hashed password from the DB
    const storedPasswordHash = findUser.password; 

    console.log("Stored password hash (from DB):", storedPasswordHash);

    if (!storedPasswordHash || typeof storedPasswordHash !== 'string') {
        console.error(`Error: User '${username}' found, but 'password' field is missing or not a string in the database.`);
        return res.status(500).json({
            message: "Internal server error: User data corrupted. Please contact support."
        });
    }

    try {
        const passwordMatch = await bcrypt.compare(password, storedPasswordHash);

        if (!passwordMatch) {
            return res.status(411).json({
                message: "Incorrect password. Please try again"
            });
        }

        // --- Debugging Step 3: Check JWT Secret ---
        const jwtSecret = process.env.JWT_USER_SECRET;
        console.log("JWT Secret loaded:", jwtSecret ? "Yes" : "No (or undefined)");

        if (!jwtSecret) {
            console.error("JWT_USER_SECRET environment variable is not set!");
            return res.status(500).json({
                message: "Server configuration error: JWT secret missing."
            });
        }

        const token = jwt.sign(
            { userId: findUser._id }, // Use a clearer key like 'userId'
            jwtSecret,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Successfully signed in",
            token: token
        });

    } catch (error) {
        console.error("Error during bcrypt.compare or JWT signing:", error);
        return res.status(500).json({
            message: "An unexpected error occurred during sign-in."
        });
    }
});

//@ts-ignore
userRouter.post("/content", UserMiddleware, async function (req, res) {
    const { type, link, title, tags } = req.body;

    //@ts-ignore
    const UserID = req.userId;
    console.log(UserID, '\n')
    console.log(type, '\n', link, '\n', title, '\n', tags, '\n');
    try {
        await contentModel.create({
            type: type,
            link: link,
            title: title,
            tags: tags,
            userId: UserID,
        })


        res.status(200).json({ message: "Content created successfully" });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

//@ts-ignore
userRouter.get("/content", UserMiddleware, async (req:Request, res:Response) => {
    try{
        //@ts-ignore
        const userid = req.userId;
    
        //checking userid present or not
        if(!userid){
          res.status(400).json({ message: "Something wrong" });
          return;
        }

        // find the data in the contentModel via userId(a key in document) via userid(from the above req.userId)
        const userData = await contentModel.find({ userId: userid });
        // 
        console.log("userData: ", userData);
        res.status(200).json({
          message: "User data fetched successfully",
          data: userData,
        });
        console.log(userData)
      }catch(err){
        console.log("Err(catch): something went wrong",err)
        return;
      }
})

userRouter.delete("/content", UserMiddleware, async (req:Request, res:Response) => {
    try{
        const userid = req.userId;
        const userTitle = req.body.contentId; // have a contentid in the req.body
        
        console.log("userid =>", userid)
        console.log("contentid =>", userTitle)
    
        if (!userid || !userTitle) {
           res.status(400).json({ message: "User ID or Content ID missing" });
           return;
        }
    
        const content = await contentModel.findOne({ title: userTitle, userId: userid });
    
        if (!content) {
          res.status(404).json({ message: "Content not found or unauthorized" });
          return;
        }
    
        await contentModel.findByIdAndDelete(content);
    
         res.status(200).json({ message: "Content deleted successfully" });
         return;
      }catch(err){
        console.log("Err(catch): something went wrong",err)
        return;
      }
})
//@ts-ignore
userRouter.post("/brain/share", UserMiddleware,async (req: Request,res:Response) => {
    const share = req.body.share

    //@ts-ignore
    const userId = req.userId;
    const Hash = random(8);

    if (share) {
        const existingLink = await linkModel.findOne({
            userId: userId
        })

        if (existingLink) {
            res.json({
                message: "Shareable link already exist",
                Link: existingLink.Hash
            });

            return;
        }

        await linkModel.create({
            userId: userId,
            Hash: Hash
        })
    }
    else {
        await linkModel.deleteOne({
            userId: userId,
        })
    }

    res.json({
        message: "Sharable link is created",
        Link: Hash
    })
})

//@ts-ignore
userRouter.get("/brain/share/:shareId", UserMiddleware, async (req,res) => {
    const shareLink = req.params.shareId;
    const link = await linkModel.findOne({
        Hash: shareLink.toString()
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    const user = await userModel.findOne({
        _id: link.userId
    })

    const Content = await contentModel.find({
        userId: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return ;
    }

    res.json({
        username: user.username,
        content: Content
    })
})

export default userRouter