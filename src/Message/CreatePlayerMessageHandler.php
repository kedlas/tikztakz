<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 07/05/2017
 * Time: 10:41
 */

namespace Connect5\Message;

use Connect5\Exception\LogicException;
use Connect5\Game;
use Connect5\GameLobby;
use Connect5\Player;
use Ratchet\ConnectionInterface;

class CreatePlayerMessageHandler implements MessageHandlerInterface
{

	public const CREATE_PLAYER_KEY      = 'create_player';
	public const CREATE_PLAYER_KEY_RESP = 'create_player_resp';
	public const START_GAME_RESP_KEY    = 'start_game_resp';
	public const INFO_RESP_KEY			= 'info_resp';

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
		if ($this->lobby->findPlayer($conn)) {
			throw new LogicException('Only one player per connection is allowed.');
		}

		if (!isset($data['player_name'])) {
			throw new LogicException('Missing player name');
		}
	}

	/**
	 * @param ConnectionInterface $conn
	 * @param array               $data
	 *
	 * @return mixed
	 */
	public function processMessage(ConnectionInterface $conn, array $data)
	{
		$player = $this->lobby->createPlayer($conn, $data['player_name'] ?? NULL);
		$game   = $player->getGame();

		$this->lobby->notifyPlayer($player, $this->createRespMessage($player));

		$this->lobby->notifyAllPlayers($game, $this->createNewPlayerMessage($player));

		if ($player->getGame()->isReady()) {
			$this->lobby->notifyAllPlayers($game, $this->createGameReadyMessage($game));
		}

		return TRUE;
	}

	/**
	 * @param Player $player
	 *
	 * @return string
	 */
	private function createRespMessage(Player $player)
	{
		$msg = [
			'type'    => self::CREATE_PLAYER_KEY_RESP,
			'message' => sprintf('You entered the game.'),
			'data'    => [
				'player_id'   => $player->getId(),
				'game_id'     => $player->getGame()->getId(),
				'player_name' => $player->getName(),
				'symbol'      => $player->getSymbol(),
				'is_my_turn'  => FALSE,
			],
		];

		return json_encode($msg);
	}

	/**
	 * @param Game $game
	 *
	 * @return string
	 */
	private function createGameReadyMessage(Game $game)
	{
		$msg = [
			'type'    => self::START_GAME_RESP_KEY,
			'message' => sprintf('Game begins. It\'s "%s"\'s turn', $game->getPlayerOnTurn()->getName()),
			'data'    => [
				'player_on_turn' => $game->getPlayerOnTurn()->getId(),
				'board_size' => $game->getBoardSize(),
			],
		];

		return json_encode($msg);
	}

	/**
	 * @param Player $player
	 *
	 * @return string
	 */
	private function createNewPlayerMessage(Player $player)
	{
		$msg = [
			'type'    => self::INFO_RESP_KEY,
			'message' => sprintf('Player "%s" joined the game.', $player->getName()),
		];

		return json_encode($msg);
	}

}
