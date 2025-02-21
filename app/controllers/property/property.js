const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../../helpers/cloudinaryConfig");
const slugify = require('slugify');
const { uploadImageToCloudinary } = require("../../helpers/cloudinaryConfig");


exports.createProperty = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadImageToCloudinary(file.buffer);
        imageUrls.push(imageUrl);
      }
    }

    const propertyData = {
      price: parseFloat(req.body.price),
      emi: req.body.emi ? parseFloat(req.body.emi) : null,
      homeLoanEligible: req.body.homeLoanEligible === "true",
      area: parseInt(req.body.area),
      bhk: parseInt(req.body.bhk),
      propertyType: req.body.propertyType,
      location: req.body.location.trim(),
      city: req.body.city,
      state: req.body.state,
      beds: parseInt(req.body.beds),
      baths: parseInt(req.body.baths),
      balconies: parseInt(req.body.balconies),
      furnishingStatus: req.body.furnishingStatus.trim(),
      carpetArea: parseInt(req.body.carpetArea),
      pricePerSqft: parseFloat(req.body.pricePerSqft),
      floor: parseInt(req.body.floor),
      totalFloors: parseInt(req.body.totalFloors),
      transactionType: req.body.transactionType,
      status: req.body.status,
      facing: req.body.facing,
      ownershipType: req.body.ownershipType,
      ageOfConstruction: req.body.ageOfConstruction.trim(),
      address: req.body.address.trim(),
      offer: req.body.offer ? req.body.offer.trim() : null,
      overlooking: req.body.overlooking ? req.body.overlooking.trim() : null,
      description: req.body.description.trim(),
      images: imageUrls,
    };

    const property = await prisma.property.create({
      data: propertyData,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: "Failed to create property", details: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties", details: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const propertyId = req.query.propertyId;
    console.log("Query Params ID:", propertyId);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      console.log("Property not found for ID:", propertyId);
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Failed to fetch property", details: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { images: newImages, ...otherFields } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadImageToCloudinary(file.buffer);
        imageUrls.push(imageUrl);
      }
    }

    const existingProperty = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    const updatedData = {
      ...otherFields,
      price: parseFloat(otherFields.price),
      emi: parseFloat(otherFields.emi),
      area: parseInt(otherFields.area),
      bhk: parseInt(otherFields.bhk),
      beds: parseInt(otherFields.beds),
      baths: parseInt(otherFields.baths),
      balconies: parseInt(otherFields.balconies),
      carpetArea: parseInt(otherFields.carpetArea),
      pricePerSqft: parseFloat(otherFields.pricePerSqft),
      floor: parseInt(otherFields.floor),
      totalFloors: parseInt(otherFields.totalFloors),
      homeLoanEligible: otherFields.homeLoanEligible === 'true',
      images: imageUrls.length > 0 ? imageUrls : existingProperty.images,
    };

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ error: "Failed to update property", details: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    await prisma.property.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete property", details: error.message });
  }
};

exports.searchProperties = async (req, res) => {
  try {
    const {
      location,
      bhk,
      minPrice,
      maxPrice,
      propertyType,
      city,
      state,
      beds,
      baths,
      balconies,
      status,
      facing,
      ownershipType,
      ageOfConstruction,
      transactionType,
    } = req.query;

    const criteria = {
      where: {
        AND: [
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          state ? { state: { contains: state, mode: 'insensitive' } } : {},
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
          bhk ? { bhk: Number(bhk) } : {},
          beds ? { beds: Number(beds) } : {},
          baths ? { baths: Number(baths) } : {},
          balconies ? { balconies: Number(balconies) } : {},
          status ? { status: { equals: status, mode: 'insensitive' } } : {},
          facing ? { facing: { equals: facing, mode: 'insensitive' } } : {},
          ownershipType ? { ownershipType: { equals: ownershipType, mode: 'insensitive' } } : {},
          ageOfConstruction ? { ageOfConstruction: { equals: ageOfConstruction, mode: 'insensitive' } } : {},
          transactionType ? { transactionType: { equals: transactionType, mode: 'insensitive' } } : {},
          minPrice ? { price: { gte: Number(minPrice) } } : {},
          maxPrice ? { price: { lte: Number(maxPrice) } } : {},
          propertyType ? { propertyType: { equals: propertyType, mode: 'insensitive' } } : {},
        ],
      },
    };

    const properties = await prisma.property.findMany(criteria);

    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found matching your criteria." });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties", details: error.message });
  }
};

