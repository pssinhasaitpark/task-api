const express = require("express");
const router = express.Router();
const propertyController = require("../../controllers/property/property");
const { upload, convertImagesToWebP } = require('../../helpers/fileUploader');

router.post("/", upload, convertImagesToWebP, propertyController.createProperty);
router.get("/", propertyController.getAllProperties);
router.get("/id/", propertyController.getPropertyById);
router.put("/:id", upload, convertImagesToWebP, propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);
router.get("/q", propertyController.searchProperties);

module.exports = router;

