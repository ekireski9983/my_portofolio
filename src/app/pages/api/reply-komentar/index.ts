import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export interface ReplyComment {
  commentId: ObjectId;
  reply: string;
  date: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db();

  try {
    if (req.method === "POST") {
      const { reply, commentId } = req.body;

      // Validate the reply
      if (!reply || reply.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Reply cannot be empty" });
      }

      // Validate the commentId
      if (!commentId || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ success: false, message: "Invalid comment ID" });
      }

      // Prepare the new reply data
      const updateForm: ReplyComment = {
        commentId: new ObjectId(commentId), // Ensure commentId is ObjectId
        reply: reply,
        date: new Date(),
      };

      // Insert the reply into the 'reply-komentar' collection
      const result = await db.collection("reply-komentar").insertOne(updateForm);

      // Check if the insertion was successful
      if (!result.acknowledged) {
        return res.status(400).json({ success: false, message: "Failed to add reply" });
      }

      return res.status(200).json({ success: true, message: "Reply added successfully" });
    } 
    else if (req.method === "GET") {
      // Fetch all replies from the 'reply-komentar' collection
      const result = await db.collection("reply-komentar").find({}).toArray();

      return res.status(200).json({ success: true, data: result });
    } 
    else {
      // If method is not GET or POST
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    // Log the error and send a response
    console.error("Error while replying to comment:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
