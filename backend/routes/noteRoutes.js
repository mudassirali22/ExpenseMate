const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { getNotes, addNote, updateNote, deleteNote } = require("../controllers/noteController");

router.get("/get", protect, getNotes);
router.post("/add", protect, addNote);
router.put("/update/:id", protect, updateNote);
router.delete("/delete/:id", protect, deleteNote);

module.exports = router;
