import * as xpath from 'xpath';
import * as xmldom from 'xmldom';
import * as ccmsClient from '@jorsek/ezd-client';
import AbstractContentTypeHandler from './AbstractContentTypeHandler';
import AbstractCCMSObject from './AbstractCCMSObject';


class glossentryHandler extends AbstractContentTypeHandler {

	public async processCCMSObjectAndPublishToChatbot(ccmsObj: glossentryCCMSOjbect) {
		try{
			await ccmsObj.complete();

			const trainingPhrases = this.getTrainingPhrases(ccmsObj);
			const messages = this.getMessages(ccmsObj);
	
			return null;
			
		} catch (e) {
      console.log("ERROR!");
      // prettyLog(e);
      console.log(e);
    }

	}

	/*
		Any parsing or processing of the ccmsObj to product a training phrases array 
		can occur here. By default, most will use some version of the title, but there
		is no strict rule
	*/
	public getTrainingPhrases(ccmsObj: glossentryCCMSOjbect): string[] {

		const xmlContent = new xmldom.DOMParser().parseFromString(ccmsObj.getContent());
		
		const answerText = xpath.select("//glossterm//text()", xmlContent);

		const joinedText = answerText.join(" ");
		console.log(joinedText.replace(/\s+/g, " "));


		return ["What is "+joinedText.replace(/\s+/g, " ")];

	}

	public getMessages(ccmsObj: glossentryCCMSOjbect): string[] {

		const xmlContent = new xmldom.DOMParser().parseFromString(ccmsObj.getContent());
		
		const answerText = xpath.select("//glossdef//text()", xmlContent);

		const joinedText = answerText.join(" ");
		console.log(joinedText.replace(/\s+/g, " "));


		return [joinedText.replace(/\s+/g, " ")];

	}

}

class glossentryCCMSOjbect extends AbstractCCMSObject{
	constructor(ccmsClient: ccmsClient.Client, ccmsResponse: object) {
		super(ccmsClient, ccmsResponse);

		// We can't parse the direct result being provided as ccmsReponse
		// because glossary uses the native DITA rather than the rendered
		// HTML, which is what will be in the "content" field on this response
		this.locator = ccmsResponse['href'];
	}

	async complete(){
		if(this.isComplete) return;
		
		var uri = "";
		//const contentRes = await this.ccmsClient.content.getContent(this.locator);
		const contentRes = await this._tempRequestContentAsDITA();

		this.parseCCMSAPIResponse(contentRes);

		this.isComplete = true;
	}

	parseCCMSAPIResponse(ccmsAPIRes) {

		this.title = ccmsAPIRes.title;
		this.content = ccmsAPIRes.content;
		this.locator = ccmsAPIRes.href;
	}

	private async _tempRequestContentAsDITA() {

		const params = {
			"include-metadata": true,
			"view": "dita"
		};

		params["for-path"] = this.locator
		
		const response = await this.ccmsClient.content.axios.get(`content`, { params });

		console.log(response.data);
		return response.data;

	}

}

export { glossentryHandler as glossentryHandler, glossentryHandler as contentHandler };
export { glossentryCCMSOjbect as glossentryCCMSOjbect, glossentryCCMSOjbect as ccmsObject };