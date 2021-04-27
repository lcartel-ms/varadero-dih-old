import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import db from '../services/db';
import { DataTypes, Sequelize } from 'sequelize';
import axios from "axios";

const integrationEndpoint = process.env.INTEGRATION_ENDPOINT;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const itemname = (req.query.name || (req.body && req.body.name));
    
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

    await postEventToIntegrationLayer("Create", 1, itemname);
    context.res = {
        body:rows
    }
    }

    async function postEventToIntegrationLayer(event, rowID, itemname) {
        const eventdata = {
            "event": event,
            "rowID": rowID,
            "itemname": itemname,
          }
        try {
            const response = await axios.post(integrationEndpoint, eventdata, {
              headers: {
                'content-type': 'application/json',
                'content-length': `${eventdata.toString().length}`,
              },
            });
            return `${response.status} - ${response.statusText}`;
          } catch (err) {
            console.log("Make sure your Logic App is running");
            return err;
          }
    }



export default httpTrigger;
