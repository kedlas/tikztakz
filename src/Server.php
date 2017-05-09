<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 01/05/2017
 * Time: 19:02
 */

namespace Connect5;

use Exception;
use InvalidArgumentException;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class Server implements MessageComponentInterface
{

	/**
	 * @var SplObjectStorage
	 */
	protected $clients;

	/**
	 * @var MessageRouter
	 */
	private $router;

	/**
	 * Chat constructor.
	 */
	public function __construct()
	{

		$this->clients = new SplObjectStorage();
		$this->router = new MessageRouter();
	}

	/**
	 * @param ConnectionInterface $conn
	 */
	public function onOpen(ConnectionInterface $conn)
	{
		$this->clients->attach($conn);

		echo "New connection opened! ({$conn->resourceId})\n";
	}

	/**
	 * @param ConnectionInterface $conn
	 */
	public function onClose(ConnectionInterface $conn)
	{
		$this->clients->detach($conn);

		echo "Connection {$conn->resourceId} has disconnected\n";
	}

	/**
	 * @param ConnectionInterface $conn
	 * @param Exception          $e
	 */
	public function onError(ConnectionInterface $conn, Exception $e)
	{
		echo "An error has occurred: {$e->getMessage()}\n";

		// TODO - cancel the game

		$conn->close();
	}

	/**
	 * @param ConnectionInterface $from
	 * @param string              $msg
	 */
	public function onMessage(ConnectionInterface $from, $msg)
	{
		try {
			$msg = json_decode($msg, TRUE);
			if (json_last_error() > 0) {
				throw new InvalidArgumentException(sprintf('Invalid message. Error: %s',  json_last_error_msg()));
			}
			if (!isset($msg['type']) || !isset($msg['data'])) {
				throw new InvalidArgumentException(sprintf('Invalid message. Error: %s', json_encode($msg)));
			}

			$this->router->handleMessage($from, $msg['type'], $msg['data']);

		} catch (Exception $e) {
			$msg = [
				'type' => 'error',
				'data'=> [
					'message'=> $e->getMessage()
				]
			];
			$from->send(json_encode($msg));
		}
	}

}
