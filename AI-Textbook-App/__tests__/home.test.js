const textbookApi = require('../api/textbook/textbookApi')

// Mock fetch
global.fetch = jest.fn((upstream, args) =>{
    let ok = true;
    if(args.headers.Authorization && args.headers.Authorization === 'Bearer ok false'){
        ok = false;
    }
    return Promise.resolve({
        ok: ok,
        text: () => Promise.resolve(JSON.stringify({ authenticated: true, message: "", textbooks: [] })),
    })
})
test('Empty authorization', async () =>{
    let data = await textbookApi.loadTextbooks('');
    expect(data).toBe(null);
})

test('null authorization', async () =>{
    let data = await textbookApi.loadTextbooks(null);
    expect(data).toBe(null);
})

test('Successful call', async () =>{
    let data = await textbookApi.loadTextbooks('access token');
    expect(data).toStrictEqual({authenticated: true, message: "", textbooks: []});
})

test('ok is false', async () =>{
    let data = await textbookApi.loadTextbooks('ok false');
    expect(data).toBe(null);
})