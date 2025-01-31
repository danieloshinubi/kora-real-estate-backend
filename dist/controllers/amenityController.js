"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAmenity = exports.getAllAmenities = exports.createAmenities = void 0;
const Amenities_1 = __importDefault(require("../models/Amenities"));
const AmenityIcon_1 = __importDefault(require("../models/AmenityIcon"));
const multer_1 = __importDefault(require("multer"));
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
/**
 * @swagger
 * tags:
 *   name: Amenities
 *   description: Manage everything about listings amenities
 */
/**
 * @swagger
 * /amenities:
 *   post:
 *     summary: Create a new amenity
 *     description: Uploads an icon to Cloudinary and creates a new amenity.
 *     tags: [Amenities]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: icon
 *         type: file
 *         required: true
 *         description: The icon image file to upload. (PNG, JPG, JPEG, etc.)
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: The name of the amenity.
 *     responses:
 *       201:
 *         description: Amenity created successfully.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             amenity:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       description: The URL of the uploaded icon.
 *                     fileType:
 *                       type: string
 *                       description: The file type of the uploaded icon.
 *       400:
 *         description: Bad request, possibly due to missing file or required fields.
 *       500:
 *         description: Internal server error.
 */
const createAmenities = async (req, res) => {
    try {
        multerConfig.upload.single('icon')(req, res, async (err) => {
            try {
                if (err) {
                    return res
                        .status(err instanceof multer_1.default.MulterError ? 400 : 500)
                        .json({
                        message: 'File upload error',
                        error: err.message,
                    });
                }
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }
                // Upload the eventCentreImg to Cloudinary
                const result = await cloudinary.main.uploader.upload(req.file.path, {
                    folder: 'Kora Service/AmenityIcon',
                });
                // Create a new AmenityIcon document
                const amenityIcon = new AmenityIcon_1.default({
                    fileUrl: result.secure_url,
                    fileType: result.format,
                    fileName: result.original_filename,
                    public_id: result.public_id,
                });
                await amenityIcon.save();
                // Create a new Amenities document
                const amenity = await Amenities_1.default.create({
                    ...req.body,
                    icon: amenityIcon._id,
                });
                return res.status(201).json({
                    message: 'Amenity created successfully',
                    amenity: amenity,
                });
            }
            catch (err) {
                return res.status(500).json({ message: 'Server error', error: err });
            }
        });
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
exports.createAmenities = createAmenities;
/**
 * @swagger
 * /amenities:
 *   get:
 *     summary: Retrieve all amenities
 *     description: Fetches all amenities with their associated icons (only fileUrl and fileType).
 *     tags: [Amenities]
 *     responses:
 *       200:
 *         description: A list of amenities.
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               icon:
 *                 type: object
 *                 properties:
 *                   fileUrl:
 *                     type: string
 *                   fileType:
 *                     type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *       404:
 *         description: No amenities found.
 *       500:
 *         description: Internal server error.
 */
const getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenities_1.default.find().populate('icon', 'fileUrl fileType');
        if (!amenities || amenities.length === 0) {
            res.status(404).json({ message: 'No Amenities found', status: 404 });
        }
        res.status(200).json(amenities);
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
exports.getAllAmenities = getAllAmenities;
/**
 * @swagger
 * /amenities/{id}:
 *   delete:
 *     summary: Delete an amenity
 *     description: Removes an amenity and its associated icon from the database and Cloudinary.
 *     tags: [Amenities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the amenity to delete.
 *     responses:
 *       200:
 *         description: Amenity deleted successfully.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             status:
 *               type: integer
 *       404:
 *         description: Amenity not found.
 *       500:
 *         description: Internal server error.
 */
const deleteAmenity = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the amenity and populate the associated icon
        const amenity = await Amenities_1.default.findById(id).populate('icon');
        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found', status: 404 });
            return;
        }
        // Type-cast the populated 'icon' field to the correct type
        const icon = amenity.icon; // Ensure the correct type inference
        // Get the icon's public_id from Cloudinary
        const publicId = icon.public_id;
        // Delete the icon from Cloudinary
        const cloudinaryResult = await cloudinary.main.uploader.destroy(publicId);
        // Check if the icon was successfully deleted from Cloudinary
        if (cloudinaryResult.result !== 'ok') {
            res.status(500).json({
                message: 'Failed to delete icon from Cloudinary',
                status: 500,
            });
            return;
        }
        // Delete the AmenityIcon document from MongoDB
        await AmenityIcon_1.default.deleteOne({ _id: icon._id });
        // Delete the amenity document from MongoDB
        await Amenities_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Amenity and associated icon deleted successfully',
            status: 200,
        });
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
exports.deleteAmenity = deleteAmenity;
