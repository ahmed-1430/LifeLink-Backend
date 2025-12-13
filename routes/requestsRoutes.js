// Complete a request (volunteer)
router.post("/:id/complete", requireAuth, requireRole("volunteer"), async (req, res) => {
    const requestId = req.params.id;
    const user = req.user;

    if (!ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request id" });
    }

    try {
        const db = await connectDB();
        const requestsColl = db.collection("requests");

        const reqDoc = await requestsColl.findOne({ _id: new ObjectId(requestId) });
        if (!reqDoc) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Only accepted requests can be completed
        if (reqDoc.status !== "accepted") {
            return res.status(409).json({ message: "Only accepted requests can be completed" });
        }

        // Optional: ensure the same volunteer completes it
        if (reqDoc.acceptedBy?._id && String(reqDoc.acceptedBy._id) !== String(user._id)) {
            return res.status(403).json({ message: "You are not assigned to this request" });
        }

        const result = await requestsColl.findOneAndUpdate(
            { _id: new ObjectId(requestId) },
            {
                $set: {
                    status: "completed",
                    completedAt: new Date(),
                    completedBy: {
                        _id: user._id,
                        name: user.name || user.email,
                    },
                },
            },
            { returnDocument: "after" }
        );

        return res.json({ message: "Request marked as completed", request: result.value });
    } catch (err) {
        console.error("Complete request error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
