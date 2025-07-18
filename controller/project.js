const Project = require("../model/project");

const createProject = async (req, res) => {
  try {
    const { name, visibility } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });
    if (!name?.trim()) return res.status(400).json({ error: "Name field is required" });

    const project = await Project.create({
      name: name.trim(),
      createdBy: userId,
      visibility,
    });

    return res.status(201).json({
      message: "Project created",
      project: {
        id: project._id,
        uuid: project.uuid,
        name: project.name,
        visibility: project.visibility,
      },
    });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const projects = await Project.find({ createdBy: userId });

    return res.status(200).json({ message: "All projects", projects });
  } catch (err) {
    console.error("Get all projects error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getProjectByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const project = await Project.findOne({ uuid, createdBy: userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Project details", project });
  } catch (err) {
    console.error("Get project by UUID error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changeProjectName = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });
    if (!name?.trim()) return res.status(400).json({ error: "Name field is required" });

    const project = await Project.findOneAndUpdate(
      { uuid, createdBy: userId },
      { name: name.trim() },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Project name updated", project });
  } catch (err) {
    console.error("Change project name error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changeProjectVisibility = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { visibility } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const allowed = ["public", "private"];
    const cleanVisibility = String(visibility).toLowerCase();

    if (!visibility || !allowed.includes(cleanVisibility)) {
      return res.status(400).json({ error: "Visibility must be 'public' or 'private'" });
    }

    const project = await Project.findOneAndUpdate(
      { uuid, createdBy: userId },
      { visibility: cleanVisibility },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Visibility updated", project });
  } catch (err) {
    console.error("Change project visibility error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changeProjectArchive = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { archived } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const project = await Project.findOneAndUpdate(
      { uuid, createdBy: userId },
      { archived },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Archive status updated", project });
  } catch (err) {
    console.error("Change project archive error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addMemberToProject = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { memberId } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });
    if (!memberId) return res.status(400).json({ error: "memberId is required" });

    const project = await Project.findOneAndUpdate(
      { uuid, createdBy: userId },
      { $addToSet: { members: memberId } },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Member added to project", project });
  } catch (err) {
    console.error("Add member error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectByUuid,
  changeProjectName,
  changeProjectVisibility,
  changeProjectArchive,
  addMemberToProject,
};
