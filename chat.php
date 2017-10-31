<?php
	// загрузить файл с определением класса Chat
	require_once("chat.class.php");
	// получить тип выполняемой операции
	$mode = $_POST['mode'];
	// по умолчанию последний id = 0
	$id = 0;
	// создать новый экземпляр класса Chat
	$chat = new Chat();
	// если запрошена операция SendAndRetrieve
	if($mode == 'SendAndRetrieveNew')
	{
		//получить параметры операции,
		// используемые для добавления нового сообщения
		$name = $_POST['name'];
		$message = $_POST['message'];
		$color = $_POST['color'];
		$id = $_POST['id'];
		// проверить корректность параметров
		if ($name != '' && $message != '' && $color != '')
		{
			// записать сообщение в базу данных
			$chat->postMessage($name, $message, $color);
		}
	}
	// если запрошена операция DeleteAndRetrieve
	elseif($mode == 'DeleteAndRetrieveNew')
	{
		// удалить все существующие сообщения
		$chat->deleteMessages();
	}
	// если запрошена операция Retrieve
	elseif($mode == 'RetrieveNew')
	{
		// взять идентификатор последнего сообщения, полученного клиентом
		$id = $_POST['id'];
	}
	// очистить выходной буфер
	if(ob_get_length()) ob_clean();
	// предотвратить возможность кэширования страницы броузером
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . 'GMT');
	header('Cache-Control: no-cache, must-revalidate');
	header('Pragma: no-cache');
	header('Content-Type: text/xml');
	// отправить с сервера новые сообщения
	echo $chat->retrieveNewMessages($id);
?>