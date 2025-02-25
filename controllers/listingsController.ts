import { Request, Response } from 'express';
import Listings from '../models/Listings';
import ListingsImg, { IListingsImg } from '../models/ListingsImg';
import multer from 'multer';
import { IAmenities } from '../models/Amenities';
import { IPropertyType } from '../models/PropertyType';

const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const max_image = 2;

interface ListingType extends Document {
  name: string;
  description: string;
  amenities: IAmenities[];
  propertyType: IPropertyType;
  price: number;
  listingImg: IListingsImg[]; // Use the ListingsImgType here
}

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
 *         name: name
 *         type: string
 *         required: true
 *         description: The name of the listing.
 *         example: "Luxury Beachfront Villa"
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: A brief description of the listing.
 *         example: "A beautiful villa with an ocean view and private pool."
 *       - in: formData
 *         name: amenities
 *         type: array
 *         items:
 *           type: string
 *         required: true
 *         description: List of amenity IDs associated with the listing.
 *         example: ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cb"]
 *       - in: formData
 *         name: propertyType
 *         type: string
 *         required: true
 *         description: The ID of the property type.
 *         example: "60d0fe4f5311236168a109cc"
 *       - in: formData
 *         name: location[longitude]
 *         type: number
 *         required: true
 *         description: Longitude of the property location.
 *         example: -74.006
 *       - in: formData
 *         name: location[latitude]
 *         type: number
 *         required: true
 *         description: Latitude of the property location.
 *         example: 40.7128
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *         description: The price of the listing.
 *         example: 250.99
 *       - in: formData
 *         name: listingImg
 *         type: file
 *         required: true
 *         description: Images to upload (multiple files allowed).
 *       - in: formData
 *         name: rating
 *         type: number
 *         required: false
 *         description: Initial rating of the listing (defaults to 0).
 *         example: 4.5
 *     responses:
 *       201:
 *         description: Listing created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *                 Listing:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cd"
 *                     name:
 *                       type: string
 *                       example: "Luxury Beachfront Villa"
 *                     description:
 *                       type: string
 *                       example: "A beautiful villa with an ocean view and private pool."
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     propertyType:
 *                       type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         longitude:
 *                           type: number
 *                         latitude:
 *                           type: number
 *                     price:
 *                       type: number
 *                     listingImg:
 *                       type: array
 *                       items:
 *                         type: string
 *                     rating:
 *                       type: number
 *       400:
 *         description: Bad request due to missing fields or file upload errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error during listing creation.
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

const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    multerConfig.upload.array('listingImg', max_image)(
      // Limit multer to max_image
      req,
      res,
      async (err: Error | multer.MulterError | null) => {
        try {
          if (err) {
            if (err instanceof multer.MulterError) {
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
          const files = req.files as Express.Multer.File[];

          // Check if number of uploaded files exceeds max_image
          if (files.length > max_image) {
            return res.status(400).json({
              message: `You can upload a maximum of ${max_image} images.`,
            });
          }

          if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
          }

          const uploadedImages: string[] = [];
          for (const file of files) {
            const result = await cloudinary.main.uploader.upload(file.path, {
              folder: 'Kora Service/Listing',
            });
            const listingImg = new ListingsImg({
              fileUrl: result.secure_url,
              fileType: result.format,
              fileName: result.original_filename,
              public_id: result.public_id,
            });
            await listingImg.save();
            uploadedImages.push(listingImg._id);
          }

          const listing = await Listings.create({
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

const getAllListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await Listings.find()
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

const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id;

    // Find the listing to be deleted
    const listing = (await Listings.findById(listingId).populate(
      'listingImg'
    )) as ListingType | null;

    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }

    // Delete the associated images from Cloudinary
    const deleteImagePromises = listing.listingImg.map(
      async (img: IListingsImg) => {
        await cloudinary.main.uploader.destroy(img.public_id); // Delete image from Cloudinary
      }
    );

    await Promise.all(deleteImagePromises);

    // Delete the listing from the database
    await Listings.findByIdAndDelete(listingId);

    // Optionally, delete the image documents from MongoDB as well
    await ListingsImg.deleteMany({ _id: { $in: listing.listingImg } });

    res
      .status(200)
      .json({ message: 'Listing and associated images deleted successfully' });
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

export { createListing, getAllListings, deleteListing };
