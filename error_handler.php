<?php
	// установить функцию error_handler, как обработчик ошибок по умолчанию
	set_error_handler('error_handler', E_ALL);
	// функция обработки ошибок
	function error_handler($errNo, $errStr, $errFile, $errLine)
	{
		//удалить выходные данные, которые уже были созданы
		if(ob_get_length()) ob_clean();
		// вывести сообщение об ошибке
		$error_message = 'ERRNO: ' . $errNo . chr(10) . 'TEXT: ' . $errStr . chr(10) .
					'LOCATION: ' . $errFile . ', line ' . $errLine;
		echo $error_message;
		// прервать дальнейшую работу сценария PHP
		exit;
	}
?>