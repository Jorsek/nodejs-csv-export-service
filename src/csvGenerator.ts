import * as ccmsClient from '@jorsek/ezd-client';

const cb_publish_config = require("../config.json");


class CSVGenerator {
  private ccmsClient: ccmsClient.Client;


  constructor (ccmsClient: ccmsClient.Client) {
    this.ccmsClient = ccmsClient;
  }


  async doPublish () {
    try {

      const fs = require('fs');
      const glossEntry = require('./ContentTypeHandlers/glossentry');
      var csvInMem = "value;language\n"
      // Pull map from the CCMS
      const response = await this.ccmsClient.search.axios.post("/search", JSON.stringify(cb_publish_config.selectionSearch), {
        headers: {
            "Content-Type": "text/plain",
        },
      });

      const contentSet = { results: response.data.hits, total_count: response.data.totalResults };

      const components = contentSet.results;
      

      var contentObjects = [];
      // For each resource in the map, pull the content
      for(const topic of components) {
        console.log(topic.href);
		    const contentRes = await this.ccmsClient.content.getContent(topic.href);

        const type = this.extractTypeFromContentResponse(contentRes);
        
        const typeHandler = await this.getCorrectContentTypeHandler(type);

	    	const contentType = new typeHandler.ccmsObject(this.ccmsClient, contentRes);
        
        if(contentType instanceof glossEntry.ccmsObject){

          csvInMem += '"'+contentRes.title+'";"en"\n';

        }
        
      };

      fs.writeFile("out/entitiesCSV.csv", csvInMem, function (err) {
        if (err) return console.log(err);
      });

      return csvInMem;
      
    } catch (e) {
      console.log("ERROR!");
      // prettyLog(e);
      console.log(e);
    }
  }


  public async getCorrectContentTypeHandler(type: string){
    if(cb_publish_config['contentTypes'][type]){

      return await import("./ContentTypeHandlers/"+cb_publish_config['contentTypes'][type]).then((typeHandler) => {
        return typeHandler;
      });
    }else{
      throw new Error("Could not find a configuration for type: \""+ type +"\"")
    }
  }

  public extractTypeFromContentResponse(contentRes){

    return contentRes['standardMetadata']['text_single_Line']['contentType']['value'];
  }
}

export default CSVGenerator;