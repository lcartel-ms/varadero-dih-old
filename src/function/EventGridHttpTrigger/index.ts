import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from "axios";

const teamsWebhookUrl = "https://microsoft.webhook.office.com/webhookb2/910efe95-226b-42cf-8514-c26ddb6f3b55@72f988bf-86f1-41af-91ab-2d7cd011db47/IncomingWebhook/59572532ab7e4bbdb9e65e1bf6f4ab60/c8f10cf7-90e0-476d-8b93-f8547225a140";
const webApiUrl = process.env.webApiUrl;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function starting to process a request.');

  if (typeof teamsWebhookUrl !== 'undefined' || typeof webApiUrl !== 'undefined') {
    let title = "Hey Ho Let's Go - New Order!!!";
    let message = `Incoming order needs manual attention: ${context.req.body.orderId}`;

    context.log('Calling Teams');
    let teamsCallStatus = await postMessageToTeams(title, message);
    context.log(`teamsCallStatus: ${teamsCallStatus}`);
  }
  else {
    context.log('Not configured to talk to Team');
  }

  context.log('HTTP trigger function done processing a request.');

  context.res = {
    body: {
      newStatus: "awaiting user input",
      newWorkflowStatus: "processing"
    }
  };

  async function postMessageToTeams(title, message) {
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "themeColor": "0078D7",
      "title": title,
      "text": message,
      "potentialAction": [
        {
          "@type": "HttpPOST",
          "name": "It's done",
          "isPrimary": true,
          "target": `${webApiUrl}/api/items/${context.req.body.orderId}`
        },
        {
          "@type": "OpenUri",
          "name": "View order",
          "targets": [
            {
              "os": "default",
              "uri": `${webApiUrl}/api/items/${context.req.body.orderId}`
            }
          ]
        }
      ]
    }
    try {
      const response = await axios.post(teamsWebhookUrl, card, {
        headers: {
          'content-type': 'application/vnd.microsoft.teams.card.o365connector',
          'content-length': `${card.toString().length}`,
        },
      });
      return `${response.status} - ${response.statusText}`;
    } catch (err) {
      return err;
    }
  }
};

export default httpTrigger;