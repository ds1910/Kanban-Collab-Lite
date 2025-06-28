const express = require("express");
const {
  handleCreateBug,
  handleGetAllBugsForProject,
  handleGetBugById,
  handleUpdateBugById,
  handleToggleBugArchive,
  handleUpdateBugStatus,
  handleAssignUserToBug,
} = require("../controller/bug");

const router = express.Router();

router.route("/")
  .post(handleCreateBug);

router.route("/project/:projectId")
  .get(handleGetAllBugsForProject);

router.route("/:bugId")
  .get(handleGetBugById)
  .patch(handleUpdateBugById);

router.route("/:bugId/archive")
  .patch(handleToggleBugArchive);

router.route("/:bugId/status")
  .patch(handleUpdateBugStatus);

router.route("/:bugId/assign")
  .patch(handleAssignUserToBug);

module.exports = router;
