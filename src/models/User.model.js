import { DataTypes } from "sequelize";

class UserModel{
  constructor(server){
    const table = server.model.db.define('user', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true 
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },{
      tableName: 'users'
    }
    )
    this.table = table;
  }
}

export default UserModel;