<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 19/05/2017
 * Time: 22:34
 */

namespace Connect5\Message;

use Connect5\Exception\LogicException;
use Connect5\GameLobby;
use Connect5\Player;
use Ratchet\ConnectionInterface;

class DisconnectPlayerMessageHandler implements MessageHandlerInterface
{

	public const DISCONNECT_PLAYER_KEY      = 'disconnect_player';
	public const DISCONNECT_PLAYER_RESP_KEY = 'disconnect_player_resp';

	/**
	 * @var GameLobby
	 */
	private $lobby;

	/**
	 * CreatePlayerMessage constructor.
	 *
	 * @param GameLobby $lobby
	 */
	public function __construct(GameLobby $lobby)
	{
		$this->lobby = $lobby;
	}

	/**
	 * @param ConnectionInterface $conn
	 * @param array               $data
	 */
	public function validate(ConnectionInterface $conn, array $data)
	{
		if (!$this->lobby->findPlayer($conn)) {
			throw new LogicException('Unknown player disconnected.');
		}
	}

	/**
	 * @param ConnectionInterface $conn
	 * @param array               $data
	 *
	 * @return bool
	 */
	public function processMessage(ConnectionInterface $conn, array $data)
	{
		$player = $this->lobby->findPlayer($conn);
		$this->lobby->notifyAllPlayers($player->getGame(), $this->createPlayerDisconnectedMessage($player));

		$this->lobby->deleteGame($player->getGame());

		return TRUE;
	}

	/**
	 * @param Player $player
	 *
	 * @return string
	 */
	private function createPlayerDisconnectedMessage(Player $player)
	{
		$msg = [
			'type'    => self::DISCONNECT_PLAYER_RESP_KEY,
			'message' => sprintf('Player "%s" has left the game.', $player->getName()),
		];

		return json_encode($msg);
	}

}
