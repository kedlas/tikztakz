<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 01/05/2017
 * Time: 19:02
 */

namespace Connect5;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class Chat implements MessageComponentInterface
{

	/**
	 * @var SplObjectStorage
	 */
	protected $clients;

	/**
	 * Chat constructor.
	 */
	public function __construct()
	{
		$this->clients = new SplObjectStorage();
	}

	public function onOpen(ConnectionInterface $conn)
	{
		$this->clients->attach($conn);

		echo "New connection! ({$conn->resourceId})\n";
	}

	public function onClose(ConnectionInterface $conn)
	{
		$this->clients->detach($conn);

		echo "Connection {$conn->resourceId} has disconnected\n";
	}

	public function onError(ConnectionInterface $conn, \Exception $e)
	{
		echo "An error has occurred: {$e->getMessage()}\n";

		$conn->close();
	}

	public function onMessage(ConnectionInterface $from, $msg)
	{
		$numRecv = count($this->clients) - 1;
		echo sprintf(
			'Connection %d sending message "%s" to %d other connection%s' . "\n",
			$from->resourceId,
			$msg,
			$numRecv,
			$numRecv == 1 ? '' : 's'
		);

		foreach ($this->clients as $client) {
			if ($from !== $client) {
				// The sender is not the receiver, send to each client connected
				$client->send($msg);
			}
		}
	}

}
