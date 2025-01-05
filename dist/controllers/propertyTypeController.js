"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertyTypes = exports.deletePropertyType = exports.createPropertyType = void 0;
const PropertyType_1 = __importDefault(require("../models/PropertyType"));
/**
 * @swagger
 * /property-types:
 *   post:
 *     summary: Create a new property type
 *     tags: [PropertyType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the property type to create
 *                 example: "Residential"
 *     responses:
 *       201:
 *         description: Property Type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 PropertyType:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Residential"
 *                     _id:
 *                       type: string
 *                       example: "60d5f7c9d7a2c943bf0ef12d"
 *                 message:
 *                   type: string
 *                   example: "Property Type created successfully"
 *       409:
 *         description: Property Type already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Property Type already exists"
 *       500:
 *         description: Server error
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
const createPropertyType = async (req, res) => {
    const { name } = req.body;
    try {
        const existingPropertyType = await PropertyType_1.default.findOne({
            $or: [{ name }],
        });
        if (existingPropertyType) {
            res
                .status(409)
                .json({ message: 'Property Type already exists', status: 409 });
            return;
        }
        const newPropertyType = new PropertyType_1.default({ name });
        const savedPropertyType = await newPropertyType.save();
        res.status(201).json({
            PropertyType: savedPropertyType,
            message: 'Property Type created successfully',
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
exports.createPropertyType = createPropertyType;
/**
 * @swagger
 * /property-types:
 *   get:
 *     summary: Get all property types
 *     tags: [PropertyType]
 *     responses:
 *       200:
 *         description: List of property types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d5f7c9d7a2c943bf0ef12d"
 *                   name:
 *                     type: string
 *                     example: "Residential"
 *       500:
 *         description: Server error
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
const getAllPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await PropertyType_1.default.find();
        if (!propertyTypes || propertyTypes.length === 0) {
            res.status(404).json({ message: 'No Property Types found', status: 404 });
            return;
        }
        res.status(200).json(propertyTypes);
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
exports.getAllPropertyTypes = getAllPropertyTypes;
/**
 * @swagger
 * /property-types/{id}:
 *   delete:
 *     summary: Delete a property type by ID
 *     tags: [PropertyType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the property type to delete
 *         schema:
 *           type: string
 *           example: "60d5f7c9d7a2c943bf0ef12d"
 *     responses:
 *       200:
 *         description: Property Type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Property Type deleted successfully"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: Property Type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Property Type not found"
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Server error
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
const deletePropertyType = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the property type exists
        const propertyType = await PropertyType_1.default.findById(id);
        if (!propertyType) {
            res.status(404).json({ message: 'Property Type not found', status: 404 });
            return;
        }
        // Delete the property type
        await PropertyType_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Property Type deleted successfully',
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
exports.deletePropertyType = deletePropertyType;
