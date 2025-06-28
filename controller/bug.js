const express = require("express");
const Bug = require("../model/bug");

const handleCreateBug = async (req, res) => {
  const { title, description, tags, status, projectId, priority, createdBy, archived } = req.body;

  if (!title || !description || !projectId) {
    return res.status(400).json({ error: "Title and ProjectId and description are required." });
  }

  try {
    const bug = await Bug.create({ title, description, tags, status, projectId, priority, createdBy, archived });
    return res.status(201).json({ message: "Bug created successfully", bug });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong during bug creation." });
  }
};

const handleGetAllBugsForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const bugs = await Bug.find({ projectId });
    return res.status(200).json({ bugs });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch bugs." });
  }
};

const handleGetBugById = async (req, res) => {
  const bugId = req.params.bugId;

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    return res.status(200).json(bug);
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
};

const handleUpdateBugById = async (req, res) => {
  const bugId = req.params.bugId;
  const updatedData = req.body;

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    Object.assign(bug, updatedData);
    await bug.save();

    return res.status(200).json({ message: "Bug updated successfully", bug });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
};

const handleToggleBugArchive = async (req, res) => {
  const bugId = req.params.bugId;
  const { archived } = req.body;

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    bug.archived = archived;
    await bug.save();

    return res.status(200).json({ message: "Bug archive status updated", bug });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
};

const handleUpdateBugStatus = async (req, res) => {
  const bugId = req.params.bugId;
  const { status } = req.body;

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    bug.status = status;
    bug.history.push({ status, changedAt: new Date() });

    await bug.save();

    return res.status(200).json({ message: "Bug status updated successfully", bug });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
};

const handleAssignUserToBug = async (req, res) => {
  const bugId = req.params.bugId;
  const { userIds } = req.body;

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    const uniqueUsers = new Set([...bug.assignedTo.map(id => id.toString()), ...userIds]);
    bug.assignedTo = Array.from(uniqueUsers);

    await bug.save();

    return res.status(200).json({ message: "Users assigned to bug successfully", bug });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
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
