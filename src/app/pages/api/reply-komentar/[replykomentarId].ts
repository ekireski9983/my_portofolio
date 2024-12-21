import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId from mongodb

export interface ReplyComment {
  _id: ObjectId;
  reply: string;
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replycommentId } = req.query;

  // Validate `replycommentId`
  if (typeof replycommentId !== "string" || !ObjectId.isValid(replycommentId)) {
    return res.status(400).json({ error: "Invalid or missing replycommentId parameter" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);

    switch (req.method) {
      case "GET":
        try {
          // Find replies related to the comment
          const replies = await db
            .collection("replykomentar") // Specify the collection
            .find({ commentId: new ObjectId(replycommentId) }) // Use ObjectId for the query
            .sort({ createdAt: -1 }) // Sorting by createdAt descending
            .toArray();

          // Return the replies
          res.status(200).json({ data: replies as ReplyComment[] });
        } catch (error) {
          console.error("Error fetching replies:", error);
          res.status(500).json({ error: "Failed to fetch replies" });
        }
        break;

      case "POST":
        try {
          const { reply, commentId } = req.body;

          // Validate request body fields
          if (!reply || !commentId) {
            return res.status(400).json({ error: "Missing required fields" });
          }

          // Insert the new reply into the collection
          const replyDoc = {
            reply,
            commentId: new ObjectId(commentId), // Ensure commentId is an ObjectId
            createdAt: new Date(), // Store the current date and time
          };

          const result = await db.collection("replykomentar").insertOne(replyDoc);

          // Return success message
          res.status(201).json({
            success: true,
            message: "Reply successfully added",
            data: result.ops[0], // Return the newly created reply document
          });
        } catch (error) {
          console.error("Error posting reply:", error);
          res.status(500).json({ error: "Failed to post reply" });
        }
        break;

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
}
