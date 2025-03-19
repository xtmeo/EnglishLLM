// Когда приходит сообщение из popup.js
chrome.runtime.onMessage.addListener(
    function (data, sender, sendResponse) {
        parseMessage(data);
    }
);

function getTextWithLineBreaks(element) {
    let result = '';
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent + '\n';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            result += getTextWithLineBreaks(node) + '\n';
        }
    }
    return result.trim();
}

// Обрабатываем входящии сообщение
function parseMessage(data) {
    console.log(data);
    if (data.data.type) {
        var messageData = data.data;
        console.log(messageData.type);
        if (messageData.type == 'get_content') {
            const question = messageData.question;
            const element = document.querySelector(`#q${question} > div:nth-child(2)`);
            sendPopup({
                'type': 'send_content', 
                'content': (element ? getTextWithLineBreaks(element) : ''),
                'question': question
            })
        } else if (messageData.type == 'send_answers') {
            const answers = messageData.answers;
            const question = messageData.question;
            const element = document.querySelector(`#q${question} > div:nth-child(2)`);
            const inputs = element.querySelectorAll('input'); // Находим все input-поля внутри элемента
            // Проверяем, что количество input-полей совпадает с количеством ответов
            //if (inputs.length !== answers.length) {}
            inputs.forEach((input, index) => {
                input.value = answers[index]; // Заменяем значение input-поля на элемент из списка answers
            });
        }
    }
}

// Отправить сообщение в popup.js
function sendPopup(data) {
    chrome.runtime.sendMessage({"data": data}, function (response) {
        console.log(response);
    });
}

