const knex = require("../database/knex");

class roleService {
    async createRole(roleName) {
        const [roleId] = await knex('roles').insert({ name: roleName });
        return roleId;
    }

    async deleteRole(roleId) {
        await knex('roles').where('id', roleId).del();
    }

    async assignPermissionToRole(roleId, permission) {
        await knex('role_permissions').insert({ role_id: roleId, permission_id: permission });
    }

    async revokePermissionFromRole(roleId, permission) {
        await knex('role_permissions').where({ role_id: roleId, permission_id: permission }).del();
    }

    async getRolePermissions(roleId) {
        const permissions = await knex('role_permissions')
            .join('permissions', 'role_permissions.permission_id', 'permissions.id')
            .where('role_permissions.role_id', roleId)
            .select('permissions.name');
        return permissions.map((permission) => permission.name);
    }

    async hasPermission(roleId, permission) {
        const permissions = await this.getRolePermissions(roleId);
        return permissions.includes(permission);
    }
}
module.exports = roleService;
