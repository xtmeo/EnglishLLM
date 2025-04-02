# EnglishLLM - Расширение для Chromium для генерации ответов

## Что это расширение умеет делать

Это расширение умеет решать задания на сайте lms.mipt.ru

<img src="https://github.com/user-attachments/assets/7db8ac9c-151c-4cf9-9d90-e587af731c6b" width="600" />

Проверяйте, какие ответы сгенерировались, перед отправкой! Вероятность неправильной генерации значительно выше, если задание сконструировано как таблица

Также могут быть неправильные ответы, если для выполнения задания нужен текст, информация из других заданий или какие-нибудь дополнительные материалы

## Какие нейросети использует это расширение

По умолчанию используется DeepSeek V3. Со встроенным API ключом можно использовать [любую бесплатную модель отсюда](https://openrouter.ai/models?max_price=0&order=top-weekly). Для этого выберите модель, нажмите на иконку "Copy model id", откройте расширение EnglishLLM, под текстом "Выберите модель:" выберите "другое" и вставьте ранее скопированный идентификатор модели.

Если хотите использовать платные модели, то зарегистрируйтесь на сайте [openrouter.ai](https://openrouter.ai/), получите API ключ ([openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)), откройте расширение EnglishLLM, вставьте ключ в поле под текстом "Введите API ключ". [Список всех доступных моделей можно посмотреть тут](https://openrouter.ai/models?order=top-weekly).

# Инструкции

## Инструкция по установке

### Если у Вас установлен git

1) Откройте (или создайте) папку

2) Откройте в этой папке консоль, выполните команду ```git clone https://github.com/xtmeo/EnglishLLM.git```

### Иначе
1) Скачайте zip-файл
<img src="https://github.com/user-attachments/assets/becf5e75-3d07-4a0a-b802-e316217f0f2a" width="400" />

2) Распакуйте zip-файл в любую папку

### Продолжение инструкции

3) Перейдите по ссылке [chrome://extensions/](chrome://extensions/). Если вы используете Google Chrome с мобильного устройства, Вы не сможете установить никакие расширения. Вместо этого установите другой браузер на базе Chromium (например, Яндекс Браузер). [Установка расширений для мобильного Яндекс Браузера](https://dzen.ru/a/Zmwg6sq04xMp3a2t)

4) В правом верхнем углу включите режим разработчика

5) В левом верхнем углу нажмите "Загрузить распакованное расширение"

6) Выберите папку, куда Вы установили расширение

7) Рекоммендуется закрепить расширение. Для этого в Goole Chrome нажмите на специальную иконку, выберите расширение "EnglishLLM" и закрепите его
<img src="https://github.com/user-attachments/assets/79efc4e8-6268-408d-8629-37c4f53f2c14" width="50" />


## Инструкция по обновлению

### Если у Вас установлен git

1) Откройте консоль в папке, куда Вы ранее установили расширение

2) Выполнить команду ```git pull```

### Иначе

1) Скачайте актуальный zip-файл (как в предыдущем разделе)

2) Распакуйте zip-файл туда, куда Вы его распаковывали ранее

### Продолжение инструкции

3) Перейдите по ссылке [chrome://extensions/](chrome://extensions/)

4) Найдите там расширение "EnglishLLM" и нажмите на стрелочку, чтобы его перезагрузить

## Инструкция по использованию

1) Откройте упражнение по английскому, которое хотите решить (на сайте lms.mipt.ru)

2) Откройте расширение "EnglishLLM" и нажмите "Сгенерировать"

3) Подождите, пока закончится генерация, никуда не нажимая мышкой

