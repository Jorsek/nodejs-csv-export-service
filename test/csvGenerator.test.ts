import CSVGenerator from '../src/csvGenerator';
import {glossentryHandler} from '../src/ContentTypeHandlers/glossentry';
import * as ezdClient from '@jorsek/ezd-client';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';

const testingConnectionConfig = {
  org: "public-test",
  token: "--",
  rootMapId: "--",
};


describe('Publisher tests', () => {
  it('test retrieve faq Content Type Handler', async () => {
		const publisher = new CSVGenerator(new ezdClient.Client(testingConnectionConfig));

    var result = await publisher.getCorrectContentTypeHandler("Glossary Entry");
    var contentTypeHandler = new result.contentHandler();
    
    expect(contentTypeHandler).toBeInstanceOf(glossentryHandler);

  });
});