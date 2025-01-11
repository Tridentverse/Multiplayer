const Game = require("../../Models/Games/Games");
const GameSettings = require("../../Models/Games/GamesSettings");

const addGame = async (req, res) => {
  try {
    console.log(req.body);
    const newGame = new Game(req.body);
    await newGame.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error inserting game details",
      error: err.message,
    });
  }
};

const getAllGames = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search;

    const query = {
      deleted_at: null,
    };
    if (search) {
      query.gamename = { $regex: search, $options: "i" };
    }

    const result = await Game.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Game.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error geting game details",
      error: err.message,
    });
  }
};

const getSingleGame = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Game.findOne({ _id: id });
    if (!result) {
      res
        .status(404)
        .json({ success: false, message: "game record not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error geting game details",
      error: err.message,
    });
  }
};

const updateGame = async (req, res) => {
  try {
    const updatedata = req.body;
    const id = updatedata.id;
    console.log("game update called");
    const result = await Game.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      res
        .status(404)
        .json({ success: false, message: "game record not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating game details",
      error: err.message,
    });
  }
};

const deleteGame = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Game.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Game record not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting game details",
      error: err.message,
    });
  }
};

// Add or Update Settings
const addOrUpdateSettings = async (req, res) => {
  try {
    const { id, dynamicSettings } = req.body;
    console.log(req.body);
    const gameId = id;
    const settings = dynamicSettings;

    // Fetch the game type from the Game collection
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if settings already exist
    let gameSettings = await GameSettings.findOne({ gameId });

    if (gameSettings) {
      // Update existing settings
      gameSettings.settings = settings;
      await gameSettings.save();
      return res.status(200).json({
        message: "Settings updated successfully",
        success: true,
        gameSettings,
      });
    }

    // Create new settings
    gameSettings = new GameSettings({
      gameId,
      gameType: game.type,
      settings,
    });

    await gameSettings.save();
    res
      .status(201)
      .json({ message: "Settings added successfully", gameSettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllGame = async (req, res) => {
  try {
    // Find all games and populate related GameSettings
    const games = await Game.find({ deleted_at: null });

    //console.log("games", games);
    // Find related GameSettings for each game using the game _id
    const gamesWithSettings = await Promise.all(
      games.map(async (game) => {
        const settings = await GameSettings.find({ gameId: game._id });
        return {
          game,
          settings,
        };
      })
    );
    //console.log(gamesWithSettings);

    // Send the games and their settings as the response
    return res.status(200).json(gamesWithSettings);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error geting game details",
    });
  }
};

const getSingleSettings = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await GameSettings.findOne({ gameId: id });
    if (!result) {
      res
        .status(404)
        .json({ success: false, message: "game record not found" });
    }
    //console.log("single game settings response", result);
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error geting game details",
    });
  }
};

const updateGameSettings = async (req, res) => {
  try {
    const { id, settings } = req.body;
    //console.log("id:", id);
    const updated = await GameSettings.findByIdAndUpdate(
      id,
      { settings },
      { new: true }
    );
    res.json({ success: true, result: updated, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error geting game details",
    });
  }
};

module.exports = {
  addGame,
  getAllGames,
  getSingleGame,
  updateGame,
  deleteGame,
  addOrUpdateSettings,
  getAllGame,
  getSingleSettings,
  updateGameSettings,
};
