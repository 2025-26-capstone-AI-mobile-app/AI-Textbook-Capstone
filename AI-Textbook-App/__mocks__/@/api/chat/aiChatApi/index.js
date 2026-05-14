import React from "react";

export async function fetchChats(token){
    chats = [];

    chats.push({
        "_id": "test_id",
        "session_id": 1,
        "title": "Test chat",
        "summary": "A test chat that doesn't exist",
        "updated_at": "2025-09-23T23:42:51.609+00:00"
    })

    chats.push({
        "_id": "test_id2",
        "session_id": 2,
        "title": "A Second Test Chat",
        "summary": "Yet another chat that doesn't really exist",
        "updated_at": "2025-09-23T23:42:51.609+00:00"
    })

    return chats
}

export async function loadChat(token, session_id){
    let messages = [];

    messages.push({
        id: 'user1',
        content: "test message",
        role: "user",
        timestamp: new Date()
    })

    messages.push({
        id: 'assistant1',
        content: "test response",
        role: "assistant",
        timestamp: new Date()
    })

    return messages;
}

export async function streamMessage(token , message, textbook_id, chapter_id, session_id) {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(500)
    
    if(message === 'stream401')
        // 401 error
        return {session: null,branchCandiate: null, msg: `Invalid Token`};

    if(message === 'streamError')
        // Generic error
        return {session: session_id,branchCandiate: null, msg: `Network error: ${errorText}`};

    return {session: session_id, branchCandiate: null, msg: 'Response message'}

}

export async function updateChatSummary(token, session_id) {

}