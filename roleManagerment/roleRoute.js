const express = require('express');
const roleRoute = express.Router();
const RoleController = require('./roleController');
const checkAccess = require('../midleware/checkUser').checkAccess;

const roleController = new RoleController();

// Tạo role mới
roleRoute.post('/', async (req, res) => {
    await roleController.createRole(req, res);
});

// Xóa role
roleRoute.delete('/:roleId', async (req, res) => {
    await roleController.deleteRole(req, res);
});

// Gán quyền hạn cho role
roleRoute.post('/:roleId/AddPermissions', async (req, res) => {
    await roleController.assignPermissionToRole(req, res);
});

// Thu hồi quyền hạn từ role
roleRoute.delete('/:roleId/DeletePermissions', async (req, res) => {
    await roleController.revokePermissionFromRole(req, res);
});

// Lấy danh sách quyền hạn của role
roleRoute.get('/:roleId/permissions', async (req, res) => {
    await roleController.getRolePermissions(req, res);
});

// Kiểm tra quyền hạn của role
roleRoute.get('/:roleId/permissions/:permission', async (req, res) => {
    await roleController.hasPermission(req, res);
});

module.exports = roleRoute;
