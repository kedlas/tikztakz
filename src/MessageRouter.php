<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 07/05/2017
 * Time: 10:30
 */

namespace Connect5;

use Connect5\Exception\LogicException;
use Connect5\Message\AddMoveMessageHandler;
use Connect5\Message\CreatePlayerMessageHandler;
use Connect5\Message\DisconnectPlayerMessageHandler;
use Ratchet\ConnectionInterface;

class MessageRouter
{

	/**
	 * @var CreatePlayerMessageHandler
	 */
	private $createPlayerHandler;

	/**
	 * @var AddMoveMessageHandler
	 */
	private $addMoveHandler;

	/**
	 * @var DisconnectPlayerMessageHandler
	 */
	private $disconnectHandler;

	/**
	 * MessageRouter constructor.
	 */
	public function __construct()
	{
		$this->lobby = new GameLobby();

		$this->createPlayerHandler = new CreatePlayerMessageHandler($this->lobby);
		$this->addMoveHandler      = new AddMoveMessageHandler($this->lobby);
		$this->disconnectHandler   = new DisconnectPlayerMessageHandler($this->lobby);
	}

	/**
	 * @param ConnectionInterface $conn
	 * @param string              $type
	 * @param array               $data
	 */
	public function handleMessage(ConnectionInterface $conn, string $type, array $data)
	{
		$handler = NULL;
		switch ($type) {
			case CreatePlayerMessageHandler::CREATE_PLAYER_KEY:
				$handler = $this->createPlayerHandler;
				break;
			case AddMoveMessageHandler::ADD_MOVE_KEY:
				$handler = $this->addMoveHandler;
				break;
			case DisconnectPlayerMessageHandler::DISCONNECT_PLAYER_KEY:
				$handler = $this->disconnectHandler;
				break;
			default:
				throw new LogicException(sprintf('Invalid message type: "%s"', $type));
		}

		$handler->validate($conn, $data);
		$handler->processMessage($conn, $data);
	}

}
