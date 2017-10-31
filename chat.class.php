<?php
	// загрузить конфигурационный файл
	require_once('config.php');
	// загрузить модуль обработки ошибок
	require_once('error_handler.php');
	// этот класс содержит реализацию серверной
	// функциональности приложения Chat
	class Chat
	{
		// соединение с базой данных
		private $mMysqli;
		// конструктор, открывает соединение с базой данных
		function __construct()
		{
			// установить соединение с базой данных
			$this->mMysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
		}
		
		// деструктор, закрывает соединение с базой данных
		public function __destruct()
		{
			$this->mMysqli->close();
		}
		
		// очищает таблицу, содержащую сообщения
		public function deleteMessages()
		{
			// собрать строку SQL-запроса, который очистит таблицу
			$query = 'TRUNCATE TABLE chat';
			// выполнить SQL-запрос
			$result = $this->mMysqli->query($query);
		}
		
		/*
		Метод postMessages записывает сообщение в базу данных
			- $name - имя пользователя, пославшего сообщение
			- $messsage – текст сообщения
			- $color - цвет, выбранный пользователем
		*/
		public function postMessage($name, $message, $color)
		{
			// экранировать служебные символы для пущей безопасности
			// прежде чем передавать данные в базу данных
			$name = $this->mMysqli->real_escape_string($name);
			$message = $this->mMysqli->real_escape_string($message);
			$color = $this->mMysqli->real_escape_string($color);
			// собрать SQL-запрос, который добавит новое сообщение
			$query = 'INSERT INTO chat(posted_on, user_name, message, color) ' .
				'VALUES (NOW(), "' . $name . '" , "' . $message .'","' . $color . '")';
			// выполнить запрос
			$result = $this->mMysqli->query($query);
		}
		
		/*
			Метод retrieveNewMessages извлекает новые сообщения,
			которые были посланы на сервер.
			- $id – параметр, переданный клиентом, это идентификатор
			последнего сообщения, полученного клиентом.
			Сообщения, с идентификаторами большими, чем $id будут извлечены
			из базы данных и возвращены клиенту в формате XML.
		*/
		public function retrieveNewMessages($id=0)
		{
			// экранировать служебные символы
			$id = $this->mMysqli->real_escape_string($id);
			// собрать SQL-запрос, который извлечет новые сообщения
			if($id>0)
			{
				// извлечь сообщения, более новые, чем $id
				$query =
					'SELECT chat_id, user_name, message, color, ' .
					' DATE_FORMAT(posted_on, "%Y-%m-%d %H:%i:%s") ' .
					' AS posted_on ' .
					' FROM chat WHERE chat_id > ' . $id .
					' ORDER BY chat_id ASC';
			}
			else
			{
				// на начальной загрузке вернуть только последние 50 сообщений
				$query =
				' SELECT chat_id, user_name, message, color, posted_on FROM ' .
				' (SELECT chat_id, user_name, message, color, ' .
				' DATE_FORMAT(posted_on, "%Y-%m-%d %H:%i:%s") AS posted_on ' .
				' FROM chat ' .
				' ORDER BY chat_id DESC ' .
				' LIMIT 50) AS Last50' .
				' ORDER BY chat_id ASC';
			}
			// выполнить запрос
			$result = $this->mMysqli->query($query);
			// собрать ответ в формате XML
			$response = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
			$response .= '<response>';
			// вывести признак очистки
			$response .= $this->isDatabaseCleared($id);
			// проверить, а были ли новые сообщения в базе данных
			if($result->num_rows)
			{
				// добавить все извлеченные из базы данных сообщения
				// в ответ, который будет послан клиенту
				while ($row = $result->fetch_array(MYSQLI_ASSOC))
				{
					$id = $row['chat_id'];
					$color = $row['color'];
					$userName = $row['user_name'];
					$time = $row['posted_on'];
					$message = $row['message'];
					$response .= '<id>' . $id . '</id>' .
					'<color>' . $color . '</color>' .
					'<time>' . $time . '</time>' .
					'<name>' . $userName . '</name>' .
					'<message>' . $message . '</message>';
				}
				// закрыть соединение с базой данных
				$result->close();
			}
			// вставить завершающий тег XML в ответ и вернуть его
			$response = $response . '</response>';
			return $response;
		}
			
		/*
		Метод isDatabaseCleared проверяет, производилось ли удаление
		сообщений с момента последнего обращения к серверу
		- $id – идентификатор последнего сообщения, принятого клиентом
		*/
		private function isDatabaseCleared($id)
		{
			if($id>0)
			{
				// подсчитав кол-во записей, в которых значение id меньше
				// чем $id мы узнаем, проводилась ли операция очистки
				// с момента последнего обращения клиента
				$check_clear = 'SELECT count(*) old FROM chat where chat_id<=' . $id;
				$result = $this->mMysqli->query($check_clear);
				$row = $result->fetch_array(MYSQLI_ASSOC);
				// если очистка проводилась, необходимо очистить область сообщений
				if($row['old']==0)
					return '<clear>true</clear>';
			}
			return '<clear>false</clear>';
		}
	}
?>