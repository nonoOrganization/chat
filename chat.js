/* chatURL-URL страницы обновления сообщений */
var chatURL = "chat.php";
/* getColorURL-URL страницы, которая возвращает код выбранного цвета */
var getColorURL = "get_color.php";
/* создать объекты XMLHttpRequest, которые будут использоваться
 для получения сообщений и цвета */
var xmlHttpGetMessages = createXmlHttpRequestObject();
var xmlHttpGetColor = createXmlHttpRequestObject();
/* переменные, определяющие частоту обращений к серверу */
var updateInterval = 1000; // кол-во миллисекунд перед
 // обращением за новым сообщением
// если true – выводить подробные сообщения об ошибках
var debugMode = true;
/* инициализировать кэш сообщений */
var cache = new Array();
/* lastMessageID – идентификатор самого последнего сообщения */
var lastMessageID =-1;
/* mouseX, mouseY – координаты указателя мыши */
var mouseX,mouseY;


/* создает экземпляр объекта XMLHttpRequest */
function createXmlHttpRequestObject()
{
	// ссылка на объект XMLHttpRequest
	var xmlHttp;
	// эта часть кода должна работать во всех броузерах, за исключением
	// IE6 и более старых его версий
	try
	{
		// попытаться создать объект XMLHttpRequest
		xmlHttp = new XMLHttpRequest();
	}
	catch(e)
	{
		// предполагается, что в качестве броузера используется
		// IE6 или более старая его версия
		var XmlHttpVersions = new Array("MSXML2.XMLHTTP.6.0",
		"MSXML2.XMLHTTP.5.0",
		"MSXML2.XMLHTTP.4.0",
		"MSXML2.XMLHTTP.3.0",
		"MSXML2.XMLHTTP",
		"Microsoft.XMLHTTP");
		// попробовать все возможные prog id,
		// пока какая-либо попытка не увенчается успехом
		for (var i=0; i<XmlHttpVersions.length && !xmlHttp; i++)
		{
			try
			{
				// попытаться создать объект XMLHttpRequest
				xmlHttp = new ActiveXObject(XmlHttpVersions[i]);
			}
			catch (e) {}
		}
	}
	
	// вернуть созданный объект или вывести сообщение об ошибке
	if (!xmlHttp)
		alert("Ошибка создания объекта XMLHttpRequest.");
	else
		return xmlHttp;
}

/* функция инициализации чата; исполняется,
 когда будет загружена страница */
function init()
{
	alert("Init.js");
	// получить ссылку на элемент ввода, где пользователь вводит текст
	var oMessageBox = document.getElementById("messageBox");
	// предотвратить запуск функции автодополнения
	oMessageBox.setAttribute("autocomplete", "off");
	// ссылка на текст «текст будет выводиться таким цветом»
	var oSampleText = document.getElementById("sampleText");
	// цвет по умолчанию-черный
	oSampleText.style.color = "black";
	// назначить пользователю случайное имя по умолчанию
	checkUsername();
	// инициировать процесс обновления окна чата
	requestNewMessages();
}

// эта функция назначает имя пользователя по умолчанию,
// если таковое еще не задано
function checkUsername()
{
 // обеспечивает назначение случайного имени пользователя
 // при загрузке формы
 var oUser=document.getElementById("userName");
 if(oUser.value == "")
 oUser.value = "Guest" + Math.floor(Math.random() * 1000);
}
/* эта функция вызывается по нажатию на кнопку «Отправить» */
function sendMessage()
{
	alert( "hallo)))");
 // сохранить текст сообщения в переменной и очистить поле ввода
 var oCurrentMessage = document.getElementById("messageBox");
 var currentUser = document.getElementById("userName").value;
 var currentColor = document.getElementById("color").value;
 // не передавать пустое сообщение
 if (trim(oCurrentMessage.value) != "" &&
 trim(currentUser) != "" && trim (currentColor) != "")
 {
 // нам необходимо передать сообщение и получить новые сообщения
 params = "mode=SendAndRetrieveNew" +
 "&id=" + encodeURIComponent(lastMessageID) +
 "&color=" + encodeURIComponent(currentColor) +
 "&name=" + encodeURIComponent(currentUser) +
 "&message=" + encodeURIComponent(oCurrentMessage.value);
 // добавить сообщение в очередь
 cache.push(params);
 // очистить поле ввода
 oCurrentMessage.value = "";
 }
}
/* эта функция вызывается по нажатию на кнопку «Очистить» */
function deleteMessages()
{
 // установить тип требуемой операции
 params = "mode=DeleteAndRetrieveNew";
 // добавить сообщение в очередь
 cache.push(params);
}
/* производит асинхронные обращения к серверу за получением новых
сообщений, отправляет сообщения из очереди и очищает сообщения */
function requestNewMessages()
{
 // получить имя пользователя и цвет
 var currentUser = document.getElementById("userName").value;
 var currentColor = document.getElementById("color").value;
 // продолжать только если xmlHttpGetMessages не содержит пустую ссылку
 if(xmlHttpGetMessages)
 {
 try
 {
 // не выполнять никаких операций, если еще
 // не завершилась предыдущая
 if (xmlHttpGetMessages.readyState == 4 || xmlHttpGetMessages.readyState == 0)
 {
	// параметры запроса, отправляемого серверу
	var params = "";
	// если в очереди есть запросы, извлечь самый старый
	if (cache.length>0)
		params = cache.shift();
		// если кэш пуст – просто получить новые сообщения
	else
		params = "mode=RetrieveNew" +"&id=" +lastMessageID;
	
	// послать серверу запрос на выполнение операции
	xmlHttpGetMessages.open("POST", chatURL, true);
	xmlHttpGetMessages.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xmlHttpGetMessages.onreadystatechange = handleReceivingMessages;
	xmlHttpGetMessages.send(params);
 }
 else
 {
	// запланировать очередную проверку наличия новых сообщений
	setTimeout("requestNewMessages();", updateInterval);
 }
 }
 catch(e)
 {
 displayError(e.toString());
 }
 }
}
/* эта функция обрабатывает ответы http при получении новых сообщений */
function handleReceivingMessages()
{
 // продолжить только если прием завершен
 if (xmlHttpGetMessages.readyState == 4)
 {
 // продолжать только если статус HTTP = «OK»
 if (xmlHttpGetMessages.status == 200)
 {
 try
 {
 // обработать ответ сервера
 readMessages();
 }
 catch(e)
 {
 // вывести сообщение об ошибке
 displayError(e.toString());
 }
 }
 else
 {
 // вывести сообщение об ошибке
 displayError(xmlHttpGetMessages.statusText);
 }
 }
}
/* эта функция обрабатывает ответы сервера при получении новых сообщений */
function readMessages()
{
 // получить ответ сервера
 var response = xmlHttpGetMessages.responseText;
 // ошибка сервера?
 if (response.indexOf("ERRNO") >= 0
 || response.indexOf("error:") >= 0
 || response.length == 0)
 throw(response.length == 0 ? "Void server response." : response);
 // получить ссылку на корневой элемент
 response = xmlHttpGetMessages.responseXML.documentElement;
 // получить признак необходимости очистки области сообщений
 clearChat =
 response.getElementsByTagName("clear").item(0).firstChild.data;
 // если очистку необходимо провести
 if(clearChat == "true")
 {
 // очистить область сообщений и сбросить id
 document.getElementById("scroll").innerHTML = "";
 lastMessageID = -1;
 }
 // извлечь массивы из ответа сервера
 idArray = response.getElementsByTagName("id");
 colorArray = response.getElementsByTagName("color");
 nameArray = response.getElementsByTagName("name");
 timeArray = response.getElementsByTagName("time");
 messageArray = response.getElementsByTagName("message");
 // вывести новые сообщения в окно сообщений
 displayMessages(idArray, colorArray, nameArray, timeArray,
 messageArray);
 // сохранить идентификатор последнего принятого сообщения
 if(idArray.length>0)
 lastMessageID = idArray.item(idArray.length - 1).firstChild.data;
 // перезапустить последовательность действий
 setTimeout("requestNewMessages();", updateInterval);
}
/* эта функция добавляет новые сообщения в окно сообщений */
function displayMessages(idArray, colorArray, nameArray,
 timeArray, messageArray)
{
 // на каждом проходе цикла добавляется одно сообщение
 for(var i=0; i<idArray.length; i++)
 {
 // получить информацию о сообщении
 var color = colorArray.item(i).firstChild.data.toString();
 var time = timeArray.item(i).firstChild.data.toString();
 var name = nameArray.item(i).firstChild.data.toString();
 var message = messageArray.item(i).firstChild.data.toString();
 // собрать код HTML для отображения сообщения
 var htmlMessage = "";
 htmlMessage += "<div class=\"item\" style=\"color:" + color + "\">";
 htmlMessage += "[" + time + "] " + name + " said: <br/>";
 htmlMessage += message.toString();
 htmlMessage += "</div>";
 // вывести сообщение
 displayMessage (htmlMessage);
 }
}
// выводит сообщение
function displayMessage(message)
{
 // получить ссылку на элемент
 var oScroll = document.getElementById("scroll");
 // проверить – необходимо ли будет прокручивать окно
 // после добавления сообщения
 var scrollDown = (oScroll.scrollHeight -/* вычисляет координаты указателя мыши */
function getMouseXY(e)
{
 // в зависимости от типа броузера
 if(window.ActiveXObject)
 {
 mouseX = window.event.x + document.body.scrollLeft;
 mouseY = window.event.y + document.body.scrollTop;
 }
 else
 {
 mouseX = e.pageX;
 mouseY = e.pageY;
 }
}

/* выполняет обращение к серверу за получением кода выбранного цвета */
function getColor(e)
{
	getMouseXY(e);
	// ничего не делать, если ссылка на объект XMLHttpRequest содержит null
	if(xmlHttpGetColor)
	{
		// инициализировать смещения по осям координат
		var offsetX = mouseX;
		var offsetY = mouseY;
		// получить ссылки
		var oPalette = document.getElementById("palette");
		var oTd = document.getElementById("colorpicker");
		// вычислить координаты в окне
		if(window.ActiveXObject)
		{
			offsetX = window.event.offsetX;
			offsetY = window.event.offsetY;
		}
		else
		{
			offsetX -= oPalette.offsetLeft + oTd.offsetLeft;
			offsetY-= oPalette.offsetTop + oTd.offsetTop;
		}
		// послать серверу запрос, чтобы получить цвет
		try
		{
			if (xmlHttpGetColor.readyState == 4 || xmlHttpGetColor.readyState == 0)
			{
				params = "?offsetx=" + offsetX + "&offsety=" + offsetY;
				xmlHttpGetColor.open("GET", getColorURL+params, true);
				xmlHttpGetColor.onreadystatechange = handleGettingColor;
				xmlHttpGetColor.send(null);
			}
		} oScroll.scrollTop <= oScroll.offsetHeight );
		// отобразить сообщение
		oScroll.innerHTML += message;
		// прокрутить окно вниз, если необходимо
		oScroll.scrollTop = scrollDown ? oScroll.scrollHeight :
		oScroll.scrollTop;
	}
}

// эта функция выводит сообщение об ошибке
function displayError(message)
{
 // вывести подробное сообщение, если debugMode = true
 displayMessage("Ошибка доступа к серверу! "+
 (debugMode ? "<br/>" + message : ""));
}
/* функция обработки нажатия клавиш, обнаруживает нажатие на клавишу Enter */
function handleKey(e)
{
 // получить событие
 e = (!e) ? window.event : e;
 // получить код символа нажатой клавиши
 code = (e.charCode) ? e.charCode :
 ((e.keyCode) ? e.keyCode :
 ((e.which) ? e.which : 0));
 // обработать событие keydown
 if (e.type == "keydown")
 {
 // если нажата клавиша Enter (код 13)
 if(code == 13)
 {
 // отправить текущее сообщение
 sendMessage();
 }
 }
}
/* удаляет ведущие и завершающие пробелы из строки */
function trim(s)
{
 return s.replace(/(^\s+)|(\s+$)/g, "")
}
catch(e)
 {
 // вывести сообщение об ошибке
 displayError(xmlHttp.statusText);
 }
 }
}
/* эта функция обслуживает ответ http */
function handleGettingColor()
{
 // если сообщение получено, решить, что с ним делать
 if (xmlHttpGetColor.readyState == 4)
 {
 // только если статус HTTP = «OK»
 if (xmlHttpGetColor.status == 200)
 {
 try
 {
 //изменить цвет
 changeColor();
 }
 catch(e)
 {
 // вывести сообщение об ошибке
 displayError(xmlHttpGetColor.statusText);
 }
 }
 else
 {
 // вывести сообщение об ошибке
 displayError(xmlHttpGetColor.statusText);
 }
 }
}
/* эта функция изменяет цвет, которым будет отображаться текст сообщений */
function changeColor()
{
 response=xmlHttpGetColor.responseText;
 // ошибка сервера?
 if (response.indexOf("ERRNO") >= 0
 || response.indexOf("error:") >= 0
 || response.length == 0)
 throw(response.length == 0 ? "Невозможно изменить цвет!" : response);
 // изменить цвет
 var oColor = document.getElementById("color");
 var oSampleText = document.getElementById("sampleText");
 oColor.value = response;
 oSampleText.style.color = #ff0000;
}
