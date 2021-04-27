import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import db from '../services/db';
import { DataTypes, Sequelize } from 'sequelize';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        console.log(`Trying to connect to: ${process.env.PGHOST}`);
        await db.authenticate();
        console.log(`Database connection OK!`);
        await db.sync({ force: true });
        await db.models.item.create({ name: "azure" })
    } catch (error) {
        console.log(`Unable to connect to the database:`);
        console.log(error.message);
        process.exit(1);
    }
    const rows = await db.models['item'].findAll(); 
    console.log(rows);

    context.res = {
        body:rows
    }
    }



export default httpTrigger;

