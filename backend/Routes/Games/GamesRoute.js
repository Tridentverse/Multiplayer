const {
  addGame,
  getAllGames,
  getSingleGame,
  updateGame,
  deleteGame,
  addOrUpdateSettings,
  getAllGame,
  getSingleSettings,
  updateGameSettings,
} = require("../../Controllers/Games/GamesController");
const express = require("express");
const router = express.Router();

router.post("/addgame", addGame);
router.put("/updategames", updateGame);
router.get("/getallgames", getAllGames);
router.post("/getsinglegame", getSingleGame);
router.delete("/deletegame", deleteGame);

router.put("/addorupdatesettings", addOrUpdateSettings);
router.get("/getallgame", getAllGame);
router.post("/getsinglesettings", getSingleSettings);
router.put("/updategamesettings", updateGameSettings);

module.exports = router;
