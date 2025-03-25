const express = require("express");
const Branch = require("../models/branch");
const router = express.Router();

router.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }});

router.get("/branch/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: "Error-404: Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }});

router.post("/branch", async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);

  } catch (error) {
    res.status(400).json({ error: "Data entered incorrectly" });
  }});

router.put("/branch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Branch.update(req.body, { where: { id } });

    if (updated) {
      const updatedBranch = await Branch.findByPk(id);
      res.json(updatedBranch);
    } else {
      res.status(404).json({ error: "Error-404: Branch not found" });
    }} catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }});

router.delete("/branch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Branch.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Branch deleted successfully" });
    } else {
      res.status(404).json({ error: "Error-404: Branch not found" });
    }} catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }});

module.exports = router;
