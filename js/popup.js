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
            processContent(messageData.content, messageData.question, messageData.question_type, messageData.is_question_answered);
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
async function neuroGenerate(text, promt, MODEL_ID, current_api_key) {
    let API_KEY = 'sk-or-v1-f824' + 'de8d8ddffea0f7ceafe' + '7e9fc9e6eb2b1bce' + 'fc497c6e74c7c4459f690267b';
    if (current_api_key !== '' && current_api_key != null) {
        API_KEY = current_api_key;
    }
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
                messages: [
                    { 
                        role: 'user', 
                        content: [{
                          type: 'text',
                          text: basePrompt,
                        }]
                    }
                ]
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


// Обработчик загрузки DOM
window.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generateButton');
    const popupContent = document.getElementById('popupContent');
    const modelSelect = document.getElementById('modelSelect');
    const customModel = document.getElementById('customModel');
    const apiKeyInput = document.getElementById('inputKey');
    const toggleButton = document.getElementById('toggleKeyVisibility');

    generateButton?.addEventListener('click', async function() {
        generateButton.style.display = 'none';
        popupContent.style.color = "#000000";
        popupContent.textContent = 'Поиск...';
        sendContent({'type': 'get_content', 'question': 1, 'is_question_answered': false});
    });

    // Model pick

    chrome.storage.local.get(['selectedModel'], function(result) {
        const savedModel = result.selectedModel || 'deepseek/deepseek-chat:free';
        if ((savedModel !== 'deepseek/deepseek-chat:free') && (savedModel !== 'deepseek/deepseek-r1:free')) {
            modelSelect.value = 'custom';
            customModel.value = savedModel;
            customModel.classList.remove('hidden');
        } else {
            modelSelect.value = savedModel;
            customModel.classList.add('hidden');
            chrome.storage.local.set({ selectedModel: savedModel });
        }
    });

    modelSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customModel.classList.remove('hidden');
            customModel.focus();
            if (customModel.value !== '')
                chrome.storage.local.set({ selectedModel: customModel.value });
        } else {
            customModel.classList.add('hidden');
            chrome.storage.local.set({ selectedModel: this.value });
        }
    });

    customModel.addEventListener('input', function() {
        chrome.storage.local.set({ selectedModel: this.value });
    });

    // API key input

    chrome.storage.local.get(['openRouterAPIKey'], function(result) {
        const savedAPIKey = result.openRouterAPIKey;
        apiKeyInput.value = savedAPIKey || '';
    });

    apiKeyInput.addEventListener('input', function() {
        chrome.storage.local.set({ openRouterAPIKey: this.value });
    });

    toggleButton?.addEventListener('click', async function() {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        //toggleButton.textContent = isPassword ? '👁️🗨️' : '👁️';
    });
});

async function processContent(text, question, question_type, is_question_answered) {
    console.log(`Вопрос: ${question}`);
    if (text == '') {
        if (question <= 10) {
            sendContent({'type': 'get_content', 'question': question + 1, 'is_question_answered': is_question_answered});
            return;
        }
        if (!is_question_answered) {
            generateButton.style.display = '';
            popupContent.textContent = `Не найдено`;
            popupContent.style.color = "#cc0000";
            return;
        }
        generateButton.style.display = '';
        popupContent.textContent = `Готово!`;
        popupContent.style.color = "#008000";
        return;
    }
    popupContent.textContent = 'Генерация...';

    //popupContent.textContent = question_type;
    //return;
    //inputfield
    const current_model = (await chrome.storage.local.get(['selectedModel'])).selectedModel;
    const current_api_key = (await chrome.storage.local.get(['openRouterAPIKey'])).openRouterAPIKey;
    
    const json_result = await neuroGenerate(text, getPromt(question_type), current_model, current_api_key);
    if (json_result === null) {
        generateButton.style.display = '';
        popupContent.textContent = 'Ошибка генерации';
        popupContent.style.color = "#cc0000";
        return;
    }
    let result = '';
    try {
        result = json_result.choices[0].message.content;
    } catch {
        generateButton.style.display = '';
        popupContent.textContent = json_result.error.message;
        popupContent.style.color = "#cc0000";
        return;
    }

    const result_list = result.split('\n').map(item => item.trim()).filter(item => item !== '');
    //result_list = ['Фищиф', 'efwefwefw', ' b rewf iuwegfu weg fgweuewg y'];
    sendContent({'type': 'send_answers', 'answers': result_list, 'question': question, 'question_type': question_type});
    sendContent({'type': 'get_content', 'question': question + 1, 'is_question_answered': true});
}