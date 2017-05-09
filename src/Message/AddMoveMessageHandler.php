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
use Connect5\GameLobby;
use Connect5\Player;
use Ratchet\ConnectionInterface;

class AddMoveMessageHandler implements MessageHandlerInterface
{

	public const ADD_MOVE_KEY      = 'add_move';
	public const ADD_MOVE_KEY_RESP = 'add_move_resp';
	public const END_OF_GAME_RESP  = 'end_of_game_resp';

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
		$player = $this->lobby->findPlayer($conn);
		if (!$player) {
			throw new LogicException('Cannot add move. Invalid player.');
		}

		if (!$player->getGame()->isReady()) {
			throw new LogicException('Cannot add move. Game is not ready.');
		}

		if ($player->getGame()->isEndOfGame()) {
			throw new LogicException('Cannot add move. Game has already ended.');
		}

		if (!isset($data['coords']) ||
			!isset($data['coords']['x']) ||
			!isset($data['coords']['y'])
		) {
			throw new LogicException('Cannot add move. Invalid move coordinates.');
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
		$player = $this->lobby->findPlayer($conn);
		$game   = $player->getGame();

		$x = (int) $data['coords']['x'];
		$y = (int) $data['coords']['y'];

		$game->addMove($player, $x, $y);

		$this->lobby->notifyAllPlayers($game, $this->createAddMoveResp($player, $x, $y));

		if ($game->isEndOfGame()) {
			$this->lobby->notifyAllPlayers($game, $this->createEndOfGameResp($player));
		}
	}

	/**
	 * @param Player $player
	 * @param int    $x
	 * @param int    $y
	 *
	 * @return string
	 */
	private function createAddMoveResp(Player $player, $x, $y)
	{
		$msg = [
			'type'    => self::ADD_MOVE_KEY_RESP,
			'message' => sprintf('Player %s added move to field %s', $player->getName(), $x . ':' . $y),
			'data'    => [
				'coords' => [
					'x' => $x,
					'y' => $y,
				],
				'symbol' => $player->getSymbol(),
				'player_on_turn' => $player->getGame()->getPlayerOnTurn()->getId(),
			],
		];

		return json_encode($msg);
	}

	/**
	 * @param Player $winner
	 *
	 * @return string
	 */
	private function createEndOfGameResp(Player $winner)
	{
		$msg = [
			'type'    => self::END_OF_GAME_RESP,
			'message' => sprintf('Player %s has won the game', $winner->getName()),
			'data'    => [
				'winner_id' => $winner->getId(),
			],
		];

		return json_encode($msg);
	}

}
