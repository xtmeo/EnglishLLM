// Когда приходит сообщение из content.js
chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    //сообщение из content.js
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
            processContent(messageData.content, messageData.question);
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
async function neuroGenerate(text) {
    const API_KEY = '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';
    const MODEL_ID = 'deepseek/deepseek-chat:free';
    
    const basePrompt = `
Внимательно прочитай условие и реши задание. Пропуск слов только там, где на всю строку написано единственное слово "Answer".
Ответ запиши строго (крайне строго) в соответствии с форматом: на каждой строке должно быть то, что заменяет соответствующее слово "Answer" и ничего более.
Ответы нельзя нумеровать.

Пример (задание):
"
1)
Answer
am
Answer
.
2) Answer
Answer
the most important thing.
"

Ответ:

Who
I
is


Пояснение:
1) "Who" с большой буквы, так как в задании это слово является частью предложения, пиричём оно в начале предложения
2) В строке "2) Answer" слово "Answer" не означает пропуск, так как в этой строке есть символы кроме "Answer"
3) There is no numbering in the answer, as the number is not part of the answer.

    ===================================================

    ${text}
    `;

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

async function processContent(text, question) {
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
    const result = await neuroGenerate(text);
    const result_list = result.split('\n').map(item => item.trim()).filter(item => item !== '');
    result_list.unshift('');
    //const result = 'aboba\nabba\n24234';
    sendContent({'type': 'send_answers', 'answers': result_list, 'question': question});
    //popupContent.textContent = result;
    sendContent({'type': 'get_content', 'question': question + 1});
}