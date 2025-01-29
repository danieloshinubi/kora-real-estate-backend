'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteListing = exports.getAllListings = exports.createListing = void 0;
const Listings_1 = __importDefault(require('../models/Listings'));
const ListingsImg_1 = __importDefault(require('../models/ListingsImg'));
const multer_1 = __importDefault(require('multer'));
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const max_image = 2;
/**
 * @swagger
 * tags:
 *   name: Listings
 *   description: Manage everything about listings
 */
/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     description: This endpoint allows the user to create a new real estate listing, including uploading images.
 *     tags: [Listings]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: listingImg
 *         type: array
 *         items:
 *           type: file
 *         description: List of images to be uploaded (max 2).
 *       - in: body
 *         name: body
 *         description: Listing details.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - description
 *             - price
 *             - amenities
 *             - propertyType
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the listing.
 *             description:
 *               type: string
 *               description: Detailed description of the listing.
 *             price:
 *               type: number
 *               format: float
 *               description: Price of the listing.
 *             amenities:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of amenities associated with the listing.
 *             propertyType:
 *               type: string
 *               description: Type of property (e.g., house, apartment).
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       400:
 *         description: Bad request (invalid file upload or missing required data)
 *       500:
 *         description: Server error
 */
const createListing = async (req, res) => {
  try {
    multerConfig.upload.array('listingImg', max_image)(
      // Limit multer to max_image
      req,
      res,
      async (err) => {
        try {
          if (err) {
            if (err instanceof multer_1.default.MulterError) {
              return res
                .status(400)
                .json({ message: 'File upload error', error: err });
            } else {
              return res
                .status(500)
                .json({ message: 'File upload error', error: err });
            }
          }
          // Type assertion for req.files to treat it as an array of files
          const files = req.files;
          // Check if number of uploaded files exceeds max_image
          if (files.length > max_image) {
            return res.status(400).json({
              message: `You can upload a maximum of ${max_image} images.`,
            });
          }
          if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
          }
          const uploadedImages = [];
          for (const file of files) {
            const result = await cloudinary.main.uploader.upload(file.path, {
              folder: 'Kora Service/Listing',
            });
            const listingImg = new ListingsImg_1.default({
              fileUrl: result.secure_url,
              fileType: result.format,
              fileName: result.original_filename,
              public_id: result.public_id,
            });
            await listingImg.save();
            uploadedImages.push(listingImg._id);
          }
          const listing = await Listings_1.default.create({
            ...req.body,
            listingImg: uploadedImages,
          });
          return res.status(201).json({
            message: 'Listing created successfully',
            Listing: listing,
          });
        } catch (err) {
          return res.status(500).json(err);
        }
      }
    );
  } catch (error) {
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
exports.createListing = createListing;
/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Retrieve all listings
 *     description: Fetches all the listings in the database along with their associated images, property type, and amenities.
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: List of listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   amenities:
 *                     type: array
 *                     items:
 *                       type: string
 *                   propertyType:
 *                     type: string
 *                   listingImg:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         fileUrl:
 *                           type: string
 *       404:
 *         description: No listings found
 *       500:
 *         description: Server error
 */
const getAllListings = async (req, res) => {
  try {
    const listings = await Listings_1.default
      .find()
      .populate({
        path: 'amenities',
        populate: {
          path: 'icon',
          select: 'fileUrl',
        },
      })
      .populate('listingImg', 'fileUrl')
      .populate('propertyType', 'name')
      .exec();
    if (!listings || listings.length === 0) {
      res.status(404).json({ message: 'No Listings found', status: 404 });
    }
    res.status(200).json(listings);
  } catch (error) {
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
exports.getAllListings = getAllListings;
/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Delete a listing
 *     description: Deletes a real estate listing by its ID and also deletes associated images from Cloudinary.
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the listing to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing and associated images deleted successfully
 *       404:
 *         description: Listing not found
 *       500:
 *         description: Server error
 */
const deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    // Find the listing to be deleted
    const listing = await Listings_1.default
      .findById(listingId)
      .populate('listingImg');
    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }
    // Delete the associated images from Cloudinary
    const deleteImagePromises = listing.listingImg.map(async (img) => {
      await cloudinary.main.uploader.destroy(img.public_id); // Delete image from Cloudinary
    });
    await Promise.all(deleteImagePromises);
    // Delete the listing from the database
    await Listings_1.default.findByIdAndDelete(listingId);
    // Optionally, delete the image documents from MongoDB as well
    await ListingsImg_1.default.deleteMany({
      _id: { $in: listing.listingImg },
    });
    res
      .status(200)
      .json({ message: 'Listing and associated images deleted successfully' });
  } catch (error) {
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
exports.deleteListing = deleteListing;
