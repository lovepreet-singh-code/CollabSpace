import { Router } from "express";
import { getVersions, restoreVersion } from "../controllers/version.controller";

const router = Router();

router.get("/:docName", getVersions);
router.post("/restore/:versionId", restoreVersion);

export default router;
