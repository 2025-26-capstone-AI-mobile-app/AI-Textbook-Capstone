const textbookApi = require('../api/textbook/addTextbookApi')

// Mock fetch
global.fetch = jest.fn((upstream, args) =>{
    //change response based on code
    let ok = true;
    let status = 200;
    let code = JSON.parse(args.body).code;
    if(code === '"123456"'){
        ok = true;
    } else if(code === '404ERR'){
        ok = false;
        status = 404;
    } else if(code === '401ERR'){
        ok = false;
        status = 401;
    } else if(code === '200ERR'){
        ok = false;
        status = 200;
    } else if (code === 'THROWR'){
        throw new Error("Forced fetch error");
    }

    return Promise.resolve({
        ok: ok,
        status: status,
        text: () => Promise.resolve(JSON.stringify({ textbook_id:"852f0488-7903-4555-bf5e-a7618f2552ff",title:"Research Methods in Psychology", error:null})),
    })
})

describe('test add textbook api calls', () => {
    // Ideal case
    test('Valid code', async() => {
        let code = await textbookApi.addTextbookToLibrary("123456", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_SUCCESS);
    })

    // code shorter than 6 digits
    test('Short code', async() => {
        let code = await textbookApi.addTextbookToLibrary("12345", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INVALID_CODE);
    })

    // code longer than 6 digits
    test('Long code', async() => {
        let code = await textbookApi.addTextbookToLibrary("1234567", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INVALID_CODE);
    })

    // no authorization token
    test('Missing token', async() => {
        let code = await textbookApi.addTextbookToLibrary("123456");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INVALID_AUTHORIZATION);
    })

    // fetch returns 404 error
    test('404 Error', async() => {
        let code = await textbookApi.addTextbookToLibrary("404ERR", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INVALID_CODE);
    })

    // fetch returns 401 error
    test('401 Error', async() => {
        let code = await textbookApi.addTextbookToLibrary("401ERR", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INVALID_AUTHORIZATION);
    })

    // fetch returns 200 error
    test('200 Error', async() => {
        let code = await textbookApi.addTextbookToLibrary("200ERR", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_NETWORK_ERROR);
    })

    // fetch throws error
    test('Thrown error', async() => {
        let code = await textbookApi.addTextbookToLibrary("THROWR", "token");
        expect(code).toBe(textbookApi.ADD_TEXTBOOK_INTERNAL_ERROR);
    })
})