import { User } from '../models/user';
import { SessionFactory } from '../main/session-factory';
import { RoleDao } from './role.dao';

export class UserDao {
    public static async getAllUsers(): Promise<User[]> {
        const client = await SessionFactory.GetPool().connect();
        let result = await client.query('select * from "user"');
        let roles = await RoleDao.getAllRoles();

        return result.rows.map(e => {
            let role = roles[e.role-1];
            return new User(e.userid, e.username, e.email, e.password, e.firstname, e.lastname, role);
        });
    }

    public static async getUserById(id: number): Promise<User> {
        const client = await SessionFactory.GetPool().connect();
        let result = await client.query(`select * from "user" where userid = ${id}`);
        client.release();
        let u = result.rows[0];
        let role = await RoleDao.getRoleById(u.role);
        return new User(id, u.username, u.email, u.password, u.firstname, u.lastname, role);
    }

    public static async updateUser(req, id: number): Promise<User> {
        let b = req.body;
        const client = await SessionFactory.GetPool().connect();
        await client.query(
            'update "user"' + 
            `set username = '${b.username}',` +
            `"password" = '${b.password}',` +
            `firstname = '${b.firstname}',` +
            `lastname = '${b.lastname}',` +
            `"role" = ${b.role}` +
            `where userid = ${id};`
        );
        client.release();
        let user = await this.getUserById(id);
        return user;
    }
}