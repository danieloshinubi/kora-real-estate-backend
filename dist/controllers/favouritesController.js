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
 *     summary: Add a listing to favorites
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
 *         description: Listing added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing added to favorites"
 *       400:
 *         description: Listing is already in favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing already in favorites"
 *       500:
 *         description: Server error
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
                res.status(400).json({ message: 'Listing already in favorites' });
                return;
            }
            favourites.listing.push(listingId);
        }
        await favourites.save();
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
exports.addFavorites = addFavorites;
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
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose favorites are being retrieved
 *         example: "64c9f8e3f12e4b73bced86d2"
 *     responses:
 *       200:
 *         description: Retrieved user's favorite listings successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65b1f5e9d4a9c3e6a8f7d5c1"
 *                       user:
 *                         type: string
 *                         example: "64c9f8e3f12e4b73bced86d2"
 *                       listing:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "65a2f7e5d9c8b174e2a4e1b9"
 *       404:
 *         description: No favorites found for the user
 *       500:
 *         description: Server error
 */
const getFavourites = async (req, res) => {
    const { userId } = req.params;
    try {
        const favourites = Favourites_1.default.findOne({ user: userId });
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
