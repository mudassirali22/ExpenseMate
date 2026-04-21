const Portfolio = require("../models/Portfolio");

// @desc    Add new asset
// @route   POST /api/v1/portfolio/add
// @access  Private
exports.addAsset = async (req, res) => {
  try {
    const { assetName, ticker, assetType, amount, buyPrice, currentValue, notes, platform } = req.body;

    if (!assetName || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const asset = await Portfolio.create({
      assetName,
      ticker,
      assetType,
      amount,
      buyPrice,
      currentValue: currentValue || buyPrice * amount || 0,
      notes,
      platform,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all user assets
// @route   GET /api/v1/portfolio/get
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const assets = await Portfolio.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/v1/portfolio/delete/:id
// @access  Private
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Portfolio.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Check ownership
    if (asset.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this asset",
      });
    }

    await asset.deleteOne();

    res.status(200).json({
      success: true,
      message: "Asset removed",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// @desc    Update asset
// @route   PUT /api/v1/portfolio/update/:id
// @access  Private
exports.updateAsset = async (req, res) => {
  try {
    const { assetName, ticker, assetType, amount, buyPrice, currentValue, notes, platform } = req.body;
    let asset = await Portfolio.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Check ownership
    if (asset.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this asset",
      });
    }

    asset = await Portfolio.findByIdAndUpdate(
      req.params.id,
      {
        assetName,
        ticker,
        assetType,
        amount,
        buyPrice,
        currentValue: currentValue || buyPrice * amount || 0,
        notes,
        platform,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
