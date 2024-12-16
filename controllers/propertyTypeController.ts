import PropertyType from '../models/PropertyType';
import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: PropertyType
 *   description: For managing property types
 */

interface IPropertyType {
  name: string;
}

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

const createPropertyType = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  try {
    const existingPropertyType = await PropertyType.findOne({
      $or: [{ name }],
    });

    if (existingPropertyType) {
      res
        .status(409)
        .json({ message: 'Property Type already exists', status: 409 });
      return;
    }

    const newPropertyType = new PropertyType<IPropertyType>({ name });

    const savedPropertyType = await newPropertyType.save();

    res.status(201).json({
      PropertyType: savedPropertyType,
      message: 'Property Type created successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

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

const getAllPropertyTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const propertyTypes = await PropertyType.find();

    if (!propertyTypes || propertyTypes.length === 0) {
      res.status(404).json({ message: 'No Property Types found', status: 404 });
      return;
    }

    res.status(200).json(propertyTypes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

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

const deletePropertyType = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if the property type exists
    const propertyType = await PropertyType.findById(id);

    if (!propertyType) {
      res.status(404).json({ message: 'Property Type not found', status: 404 });
      return;
    }

    // Delete the property type
    await PropertyType.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Property Type deleted successfully',
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

export { createPropertyType, deletePropertyType, getAllPropertyTypes };
