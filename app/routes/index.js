const userRoutes = require("./user/user");
const propertyRoutes = require("./property/propertyRoutes");
const roleRoutes = require("./user/role_management");

module.exports = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/role", roleRoutes); 
  app.use("/api/properties", propertyRoutes);
};
