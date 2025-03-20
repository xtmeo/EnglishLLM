chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    parseMessage(data)
    //document.getElementById('popupContent').textContent = 'referf';

    // Если нужно отправить ответ в popup.js
    //sendResponse({"data": "Popup принял"});
});

// Обрабатываем входящии сообщение
function parseMessage(data) {
    console.log(data);
    if (data.data.type) {
        var messageData = data.data;
        console.log(messageData.type);
        if (messageData.type == 'send_content') {
            processContent(messageData.content, messageData.question, messageData.question_type);
        }
    }
}


// Отправляю сообщение в content.js в открытую вкладку
function sendContent(data) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var activeTab = tabs[0];
        //chrome.tabs.sendMessage(activeTab.id, {"message": message});
        // Если нужен ответ
        chrome.tabs.sendMessage(activeTab.id, {"data": data}, function (response) {
            console.log(response);
        });
    });
}

// Функция для нейрогенерации
async function neuroGenerate(text, promt) {
    const API_KEY = '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';
    const MODEL_ID = 'deepseek/deepseek-chat:free';
    //MODEL_ID = 'deepseek/deepseek-r1:free';
    
    const basePrompt = `${promt}\n\n==========================================\n\n${text}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [{ role: 'user', content: basePrompt }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return 'Ошибка генерации';
    }
}


// Обработчик загрузки DOM
window.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generateButton');
    const popupContent = document.getElementById('popupContent');

    generateButton?.addEventListener('click', async function() {
        generateButton.style.display = 'none';
        popupContent.textContent = 'Поиск...';
        sendContent({'type': 'get_content', 'question': 1});
    });
});

async function processContent(text, question, question_type) {
    if (text == '') {
        if (question == 1) {
            popupContent.textContent = `Не найдено`;
            return;
        }
        generateButton.style.display = '';
        popupContent.textContent = '';
        return;
    }
    popupContent.textContent = 'Генерация...';

    //popupContent.textContent = text;
    //return;
    //inputfield
    const result = await neuroGenerate(text, getPromt(question_type));
    popupContent.textContent = result;

    //return;
    const result_list = result.split('\n').map(item => item.trim()).filter(item => item !== '');
    result_list.unshift('');
    //const result = 'aboba\nabba\n24234';
    sendContent({'type': 'send_answers', 'answers': result_list, 'question': question, 'question_type': question_type});
    //popupContent.textContent = result;
    sendContent({'type': 'get_content', 'question': question + 1});
}