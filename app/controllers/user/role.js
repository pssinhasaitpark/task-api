const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authVailidation } = require("../../joivalidators");
const { handleResponse } = require("../../helpers/handleResponse");

exports.createRole = async (req, res) => {
  try {
    const result = await authVailidation.roleSchema.validateAsync(req.body);
    const { role } = req.body;

    const existingRole = await prisma.roleManagement.findUnique({
      where: { role: role },
    });

    if (existingRole) {
      return handleResponse(res, 400, "This role already exists.");
    }

    const newRole = await prisma.roleManagement.create({
      data: {
        role: role,
      },
    });

    return handleResponse(res, 201, "Role Successfully Added", { role: newRole });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.roleManagement.findMany();
    return handleResponse(res, 200, "All Roles", { data });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }

    const role_id = parseInt(id, 10);

    const data = await prisma.roleManagement.findUnique({
      where: {
        id: role_id,
      },
    });

    if (!data) {
      return handleResponse(res, 404, "Role not found with the provided id.");
    }

    return handleResponse(res, 200, "Role fetched successfully", { data });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const role_id = parseInt(id, 10);
    const { role } = req.body;

    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }

    const data = await prisma.roleManagement.findUnique({
      where: { id: role_id },
    });

    if (!data) {
      return handleResponse(res, 400, "Role not found with the provided id.");
    }

    const updatedRole = await prisma.roleManagement.update({
      where: {
        id: role_id,
      },
      data: {
        role: role,
      },
    });

    if (!updatedRole) {
      return handleResponse(res, 404, "Role not found with the provided id.");
    }

    return handleResponse(res, 200, "Role Updated Successfully", { role: updatedRole });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }

    const role_id = parseInt(id, 10);

    const role = await prisma.roleManagement.findUnique({
      where: {
        id: role_id,
      },
    });

    if (!role) {
      return handleResponse(res, 404, "Role not found with the provided id.");
    }

    await prisma.roleManagement.delete({
      where: {
        id: role_id,
      },
    });

    return handleResponse(res, 200, "Role deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};
