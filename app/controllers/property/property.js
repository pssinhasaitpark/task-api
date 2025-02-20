const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../../helpers/cloudinaryConfig");
const slugify = require('slugify');
const { uploadImageToCloudinary } = require("../../helpers/cloudinaryConfig");


exports.createProperty = async (req, res) => {
    try {
        let imageUrls = [];

        // Check if images are uploaded
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const imageUrl = await uploadImageToCloudinary(file.buffer);
                imageUrls.push(imageUrl);
            }
        }

        // Convert string values to proper types
        const propertyData = {
            price: parseFloat(req.body.price),
            emi: req.body.emi ? parseFloat(req.body.emi) : null,
            homeLoanEligible: req.body.homeLoanEligible === "true", // Convert string "true"/"false" to boolean
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
            images: imageUrls, // Store uploaded image URLs
        };

        // Create property in the database
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
      const propertyId = req.query.propertyId; // Get ID from the query string
      console.log("Query Params ID:", propertyId);

      const property = await prisma.property.findUnique({
          where: { id: propertyId }, // Ensure it's a string
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
  
      // Check if new images are uploaded
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadImageToCloudinary(file.buffer); // Ensure this function is defined
          imageUrls.push(imageUrl);
        }
      }
  
      // Get the current property data to preserve existing images if no new ones are uploaded
      const existingProperty = await prisma.property.findUnique({
        where: { id: req.params.id },
      });
  
      // Prepare updated data with type conversion
      const updatedData = {
        ...otherFields,
        price: parseFloat(otherFields.price), // Ensure price is a float
        emi: parseFloat(otherFields.emi), // Ensure emi is a float
        area: parseInt(otherFields.area), // Ensure area is an integer
        bhk: parseInt(otherFields.bhk), // Ensure bhk is an integer
        beds: parseInt(otherFields.beds), // Ensure beds is an integer
        baths: parseInt(otherFields.baths), // Ensure baths is an integer
        balconies: parseInt(otherFields.balconies), // Ensure balconies is an integer
        carpetArea: parseInt(otherFields.carpetArea), // Ensure carpetArea is an integer
        pricePerSqft: parseFloat(otherFields.pricePerSqft), // Ensure pricePerSqft is a float
        floor: parseInt(otherFields.floor), // Ensure floor is an integer
        totalFloors: parseInt(otherFields.totalFloors), // Ensure totalFloors is an integer
        homeLoanEligible: otherFields.homeLoanEligible === 'true', // Convert string to boolean
        images: imageUrls.length > 0 ? imageUrls : existingProperty.images, // Use new images if provided; otherwise, keep existing ones
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
        const { location, bhk, minPrice, maxPrice, propertyType, isFreeAd } = req.query; 
        const criteria = {
            where: {
                AND: [
                    location ? { location: { contains: location, mode: 'insensitive' } } : {},
                    bhk ? { bhk: Number(bhk) } : {},
                    minPrice ? { price: { gte: Number(minPrice) } } : {},
                    maxPrice ? { price: { lte: Number(maxPrice) } } : {},
                    propertyType ? { propertyType: { equals: propertyType } } : {},
                    isFreeAd !== undefined ? { isFreeAd: isFreeAd === 'true' } : {},
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
