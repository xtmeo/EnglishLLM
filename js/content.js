// Когда приходит сообщение из popup.js
chrome.runtime.onMessage.addListener(
    function (data, sender, sendResponse) {
        parseMessage(data);
    }
);

function getTextWithLineBreaks(element) {
    if (element === null) {
        return '';
    }
    let result = '';
    let children_separator = '\n';
    const element_tag = (element.tagName || '').toLowerCase();
    if (element.nodeType === Node.TEXT_NODE) {
        result = element.textContent + '\n';
        if (element.textContent === 'Choose...') return '';
    }
    //console.log(element_tag);

    if (element_tag === 'select') {
        result = '[[ ';
        children_separator = '; '
    } else if (element_tag === 'option') {
        if (element.textContent == 'Choose...') return '';
        return `${element.value} - "${element.textContent}"`;
    } else if (element_tag === 'label') {
        result = '';
    } else if (element_tag === 'input' && element.type === 'radio') {
        result = '[[OPTION]]';
    }

    for (const node of element.childNodes) {
        result += getTextWithLineBreaks(node) + children_separator;
    }

    if (element_tag === 'select') {
        result += ' ]]\n\n';
    }
    //console.log(result);
    return result;
}

function writeAnswers(answers, question, question_type) {
    const element = document.querySelector(`#q${question} > div:nth-child(2)`);
    if (question_type === 'inputfield') {
        const inputs = element.querySelectorAll('input');
        const filteredInputs = Array.from(inputs).filter(input => (input.type !== 'submit' && input.type !== 'hidden'));
        filteredInputs.forEach((input, index) => {
            input.value = answers[index];
        });
    } else if (question_type === 'select') {
        const inputs = element.querySelectorAll('select');
        const filteredInputs = Array.from(inputs).filter(input => input.type !== 'submit');
        filteredInputs.forEach((input, index) => {
            input.value = answers[index];
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    } else if (question_type === 'radio') {
        const inputs = element.querySelectorAll('input[type="radio"]');
        const answer = answers[0];
        inputs[answer].checked = true;
        inputs[answer].click();
    }
}

// Обрабатываем входящии сообщение
function parseMessage(data) {
    //console.log(data);
    if (data.data.type) {
        var messageData = data.data;
        //console.log(messageData.type);
        if (messageData.type == 'get_content') {
            const question = messageData.question;
            const element = document.querySelector(`#q${question} > div:nth-child(2)`);

            let question_type = 'inputfield';
            if (element && element.querySelector('select') != null) {
                question_type = 'select';
            }
            if (element && element.querySelector('input[type="radio"]') != null) {
                question_type = 'radio';
            }

            sendPopup({
                'type': 'send_content', 
                'content': (element ? getTextWithLineBreaks(element) : ''),
                'question': question,
                'question_type': question_type
            })
        } else if (messageData.type == 'send_answers') {
            writeAnswers(messageData.answers, messageData.question, messageData.question_type);
        }
    }
}

// Отправить сообщение в popup.js
function sendPopup(data) {
    chrome.runtime.sendMessage({"data": data}, function (response) {
        //console.log(response);
    });
}

