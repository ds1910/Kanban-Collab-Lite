const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectByUuid,
  changeProjectName,
  changeProjectVisibility,
  changeProjectArchive,
  addMemberToProject,
} = require("../controller/project");

const router = express.Router();

router.route("/")
  .post(createProject)
  .get(getAllProjects);

router.route("/:uuid")
  .get(getProjectByUuid);

router.route("/:uuid/name")
  .patch(changeProjectName);

router.route("/:uuid/visibility")
  .patch(changeProjectVisibility);

router.route("/:uuid/archive")
  .patch(changeProjectArchive);


  router.route("/:uuid/addmember").patch(addMemberToProject);
    
module.exports = router;
