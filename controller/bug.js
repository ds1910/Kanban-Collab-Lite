const Bug = require("../model/bug");

const handleCreateBug = async (req, res) => {
  const { title, description, tags, status, projectId, priority, archived } = req.body;
  const createdBy = req.user.id;

  if (!title || !description || !projectId) {
    return res.status(400).json({ error: "title, description, and projectId are required." });
  }

  console.log(req.body);

  try {
    const bug = await Bug.create({
     title: title,
      description: description,
     tags: tags,
      status: status,
      projectId: projectId,
      priority: priority,
      createdBy: createdBy,
      archived: archived,
    });

    console.log(bug);
    return res.status(201).json({ message: "bug created", bug });
  } catch {
    return res.status(500).json({ error: "failed to create bug" });
  }
};

const handleGetAllBugsForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const bugs = await Bug.find({ projectId });
    return res.status(200).json({ bugs });
  } catch {
    return res.status(500).json({ error: "failed to fetch bugs" });
  }
};

const handleGetBugById = async (req, res) => {
  const { bugId } = req.params;

  try {
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "bug not found" });
    return res.status(200).json(bug);
  } catch {
    return res.status(500).json({ error: "server error" });
  }
};

const handleUpdateBugById = async (req, res) => {
  const { bugId } = req.params;
  const updates = req.body;

  try {
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "bug not found" });

    Object.assign(bug, updates);
    await bug.save();

    return res.status(200).json({ message: "bug updated", bug });
  } catch {
    return res.status(500).json({ error: "server error" });
  }
};

const handleToggleBugArchive = async (req, res) => {
  const { bugId } = req.params;
  const { archived } = req.body;

  try {
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "bug not found" });

    bug.archived = archived;
    await bug.save();

    return res.status(200).json({ message: "archive status updated", bug });
  } catch {
    return res.status(500).json({ error: "server error" });
  }
};

const handleUpdateBugStatus = async (req, res) => {
  const { bugId } = req.params;
  const { status } = req.body;

  try {
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "bug not found" });

    bug.status = status;
    bug.history.push({ status, changedAt: new Date() });
    await bug.save();

    return res.status(200).json({ message: "status updated", bug });
  } catch {
    return res.status(500).json({ error: "server error" });
  }
};

const handleAssignUserToBug = async (req, res) => {
  const { bugId } = req.params;
  const { userIds } = req.body; // array of ObjectId strings

  try {
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "bug not found" });

    const unique = new Set([...bug.assignedTo.map(String), ...userIds]);
    bug.assignedTo = [...unique];
    await bug.save();

    return res.status(200).json({ message: "users assigned", bug });
  } catch {
    return res.status(500).json({ error: "server error" });
  }
};

module.exports = {
  handleCreateBug,
  handleGetAllBugsForProject,
  handleGetBugById,
  handleUpdateBugById,
  handleToggleBugArchive,
  handleUpdateBugStatus,
  handleAssignUserToBug,
};
