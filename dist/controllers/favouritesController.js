"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavourites = exports.removeFavourites = exports.addFavorites = void 0;
const Favourites_1 = __importDefault(require("../models/Favourites"));
/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API endpoints for managing favorite listings
 */
/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a listing to a user's favorites
 *     description: Allows a user to add a listing to their favorites. If the user has no existing favorites, a new record is created.
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - listingId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user adding the favorite.
 *                 example: "60d0fe4f5311236168a109cf"
 *               listingId:
 *                 type: string
 *                 description: The ID of the listing being added to favorites.
 *                 example: "60d0fe4f5311236168a109d0"
 *     responses:
 *       200:
 *         description: Listing added to favorites successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing added to favorites"
 *       400:
 *         description: Listing is already in favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing already in favorites"
 *       500:
 *         description: Server error while adding to favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
const addFavorites = async (req, res) => {
    const { userId, listingId } = req.body;
    try {
        let favourites = await Favourites_1.default.findOne({ user: userId });
        if (!favourites) {
            // If user has no favourites, create a new document
            favourites = new Favourites_1.default({
                user: userId,
                listing: [listingId],
            });
        }
        else {
            // If listing is already in favorites, return a message
            if (favourites.listing.includes(listingId)) {
                return res
                    .status(400)
                    .json({ message: 'Listing already in favorites' });
            }
            favourites.listing.push(listingId);
        }
        await favourites.save();
        return res
            .status(200)
            .json({ message: 'Listing successfully added to favorites' });
    }
    catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
    }
};
exports.addFavorites = addFavorites;
exports.default = addFavorites;
/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: Remove a listing from favorites
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - listingId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c9f8e3f12e4b73bced86d2"
 *               listingId:
 *                 type: string
 *                 example: "65a2f7e5d9c8b174e2a4e1b9"
 *     responses:
 *       200:
 *         description: Listing removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing removed from favorites"
 *       404:
 *         description: No favorites found for the user
 *       400:
 *         description: Listing not found in favorites
 *       500:
 *         description: Server error
 */
const removeFavourites = async (req, res) => {
    const { userId, listingId } = req.body;
    try {
        const favourites = await Favourites_1.default.findOne({ user: userId });
        if (!favourites) {
            res.status(404).json({ message: 'No favorites found for this user' });
            return;
        }
        // Check if listing exists in favorites
        if (!favourites.listing.includes(listingId)) {
            res.status(400).json({ message: 'Listing not found in favorites' });
            return;
        }
        // Remove listing from favorites
        favourites.listing = favourites.listing.filter((id) => id.toString() !== listingId);
        if (favourites.listing.length === 0) {
            // If no listings remain, delete the entire document
            await Favourites_1.default.deleteOne({ user: userId });
            res.status(200).json({ message: 'Favorites list removed' });
        }
        else {
            await favourites.save();
            res
                .status(200)
                .json({ message: 'Listing removed from favorites', favourites });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({
                message: 'Server error',
                error: 'An unexpected error occurred',
            });
        }
    }
};
exports.removeFavourites = removeFavourites;
/**
 * @swagger
 * /favorites/{userId}:
 *   get:
 *     summary: Get a user's favorite listings
 *     description: Retrieves all favorite listings of a specific user.
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose favorites are being retrieved.
 *         example: "60d0fe4f5311236168a109cf"
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's favorite listings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     user: "60d0fe4f5311236168a109cf"
 *                     listing: ["60d0fe4f5311236168a109d0", "60d0fe4f5311236168a109d1"]
 *       404:
 *         description: No favorites found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No favourites found"
 *       500:
 *         description: Server error while fetching favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
const getFavourites = async (req, res) => {
    const { userId } = req.params;
    try {
        const favourites = await Favourites_1.default.findOne({ user: userId }).lean();
        if (!favourites) {
            res.status(404).json({ message: 'No favourites found' });
            return;
        }
        res.status(200).json({ data: favourites });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({
                message: 'Server error',
                error: 'An unexpected error occurred',
            });
        }
    }
};
exports.getFavourites = getFavourites;
