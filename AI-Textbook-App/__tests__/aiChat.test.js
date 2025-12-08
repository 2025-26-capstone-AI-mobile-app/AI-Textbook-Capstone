const chatApi = require('../api/chat/aiChatApi')

describe('Test ai chat api calls', () => {
    test('basic call', async () => {
        await chatApi.fetchChats();
    })
})