import * as express from 'express';
import { Request, Response } from "express";
import * as ezdClient from '@jorsek/ezd-client';
import CSVGenerator from './csvGenerator';

const cb_publish_config = require("../config.json");



class App {
  public express: express.Application;

  constructor () {
    this.express = express();

    this.express.use(express.json()); 

    this.mountRoutes();
  }

  private mountRoutes (): void {
    
    this.express.get('/', async (req: Request, res: Response) => {

      res.send("Hi, I'm working");
    })

    this.express.get('/run-publish', async (req: Request, res: Response) => {
      
      var mapId = req.body['resource_id'];
      //var webhookPublishingKey = req.body['event_data']['webhook_publishing_key'];

      if(!mapId && !(mapId = process.env.CMS_ROOT_MAP_ID)){
        throw new Error("Not supplied a map id");
      }

      try {

        let ccmsConnectionConfiguration = {
          "org": process.env.CMS_ORG,
          "token": process.env.CMS_CONTENT_API_TOKEN,
          "rootMapId": mapId
        }
  
        if(process.env.CMS_CONTENT_API_HOST){
          ccmsConnectionConfiguration['hostname'] = process.env.CMS_CONTENT_API_HOST;
        }
  
        const ccmsClient = new ezdClient.Client(ccmsConnectionConfiguration);
  
        const publisher = new CSVGenerator(ccmsClient);
        return await publisher.doPublish();

      } catch (e) {
          console.log("ERROR!");
          // prettyLog(e);
          console.log(e);
      }
    })
  }

  private async transferContent (mapId: string) {
    
  }

  private async testCCMSConnection() {

    return "All good!"
  }


}

export default new App().express