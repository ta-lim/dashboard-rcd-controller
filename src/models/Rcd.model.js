import { DataTypes } from "sequelize";

class RcdModel{
  constructor(server){
    const table = server.model.db.define('rcd', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      picOne:{
        type: DataTypes.STRING(40),
        allowNull: false
      },
      picTwo: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      UIC: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      crNumber: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      timeline: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(2),
        allowNull: false
      },
    }, {
      freezeTableName: true
    })

    this.table = table
  }
}

export default RcdModel;