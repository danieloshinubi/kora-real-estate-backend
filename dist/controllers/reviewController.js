"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getReviewById = exports.createReview = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const mongoose_1 = require("mongoose");
/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Manage everything about user reviews about listings
 */
/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     description: Creates a review for a listing.
 *     operationId: createReview
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid user or listing ID
 *       500:
 *         description: Server error
 */
const createReview = async (req, res) => {
    try {
        // Destructure review data from the request body
        const { user, listing, rating, comment } = req.body;
        // Check if user and listing are valid ObjectIds
        if (!mongoose_1.Types.ObjectId.isValid(user) || !mongoose_1.Types.ObjectId.isValid(listing)) {
            res.status(400).json({ message: 'Invalid user or listing ID' });
            return;
        }
        // Create a new review instance
        const newReview = new Review_1.default({
            user,
            listing,
            rating,
            comment,
        });
        // Save the review to the database
        await newReview.save();
        // Return the created review
        res.status(201).json(newReview);
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
exports.createReview = createReview;
/**
 * @swagger
 * /reviews/{listingId}:
 *   get:
 *     summary: Get reviews for a listing
 *     description: Retrieves all reviews for a specific listing.
 *     operationId: getReviewById
 *     tags: [Review]
 *     parameters:
 *       - name: listingId
 *         in: path
 *         description: The ID of the listing to get reviews for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews for the listing
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: No reviews found for this listing
 *       500:
 *         description: Server error
 */
const getReviewById = async (req, res) => {
    const { listingId } = req.params;
    // Validate if the listingId is a valid ObjectId
    if (!mongoose_1.Types.ObjectId.isValid(listingId)) {
        res.status(400).json({ message: 'Invalid listing ID' });
        return;
    }
    try {
        // Find reviews by listing ID
        const reviews = await Review_1.default.find({ listing: listingId });
        if (reviews.length === 0) {
            res.status(404).json({ message: 'No reviews found for this listing' });
            return;
        }
        // Return the reviews
        res.status(200).json(reviews);
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
exports.getReviewById = getReviewById;
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes a specific review by its ID.
 *     operationId: deleteReview
 *     tags: [Review]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the review to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       400:
 *         description: Invalid review ID
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
const deleteReview = async (req, res) => {
    const { id } = req.params;
    // Validate if the reviewId is a valid ObjectId
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Invalid review ID' });
        return;
    }
    try {
        // Find the review by ID and delete it
        const deletedReview = await Review_1.default.findByIdAndDelete(id);
        // If no review is found, return a 404 error
        if (!deletedReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        // Return a success message
        res.status(200).json({ message: 'Review deleted successfully' });
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
exports.deleteReview = deleteReview;
