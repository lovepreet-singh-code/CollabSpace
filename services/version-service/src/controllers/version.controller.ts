import { Request, Response } from "express";
import axios from "axios";
import { VersionModel } from "../models/version.model";
import { config } from "../config";

export const getVersions = async (req: Request, res: Response) => {
    const { docName } = req.params;
    try {
        const versions = await VersionModel.find({ docName })
            .select("versionNumber createdAt")
            .sort({ versionNumber: -1 });
        res.json(versions);
    } catch (err) {
        console.error("Error fetching versions:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const restoreVersion = async (req: Request, res: Response) => {
    const { versionId } = req.params;
    try {
        const version = await VersionModel.findById(versionId);
        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        // Send state to collaboration-service to restore
        await axios.post(
            `${config.collaborationServiceUrl}/internal/documents/${version.docName}/restore`,
            version.content,
            {
                headers: { "Content-Type": "application/octet-stream" },
            }
        );

        // Optionally create a new version for the restore event?
        // For now, just restore. The next save will create a new version.

        res.json({ message: `Restored to version ${version.versionNumber}` });
    } catch (err) {
        console.error("Error restoring version:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
