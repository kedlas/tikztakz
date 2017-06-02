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
	public const INFO_RESP_KEY          = 'info_resp';

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

		if (!isset($data['player_name']) || !strlen($data['player_name'])) {
			throw new LogicException('Missing player name. Please fill your name.');
		}

		if (!isset($data['game_public'])) {
			throw new LogicException('Please specify if you want to join public game or not.');
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
		$playerName = $data['player_name'] ?? NULL;
		$gameId     = $data['game_id'] ?? NULL;
		$gamePublic = TRUE;
		if ($data['game_public'] === FALSE || strtolower($data['game_public']) === 'false') {
			$gamePublic = FALSE;
		}

		$player = $this->lobby->createPlayer($conn, $playerName);
		$game   = $this->getGame($gamePublic, $gameId);

		$this->addPlayerToGame($player, $game);

		$this->lobby->notifyPlayer($player, $this->createRespMessage($player));
		$this->lobby->notifyAllPlayers($game, $this->createNewPlayerMessage($player));

		if ($player->getGame()->isReady()) {
			$this->lobby->notifyAllPlayers($game, $this->createGameReadyMessage($game));
		}

		return TRUE;
	}

	/**
	 * @param bool        $isPublic
	 * @param null|string $gameId
	 *
	 * @return Game
	 */
	private function getGame(bool $isPublic, ?string $gameId = NULL): Game
	{
		if ($isPublic) {
			// Join random game
			return $this->lobby->getRandomPublicGame();
		}

		if (!$gameId) {
			// Create private game
			return $this->lobby->createPrivateGame();
		}

		// Player is joining existing private game
		$game = $this->lobby->findGame($gameId);
		if ($game) {
			return $game;
		}

		throw new LogicException('Trying to join non-existing game: '. $gameId);
	}

	/**
	 * @param Player $player
	 * @param Game   $game
	 */
	private function addPlayerToGame(Player $player, Game $game)
	{
		$game->addPlayer($player);
		$player->setGame($game);

		echo sprintf('Player "%s" has joined game "%s"', $player->getId(), $player->getGame()->getId());
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
				'game_public' => $player->getGame()->isPublic(),
				'player_name' => $player->getName(),
				'symbol'      => $player->getSymbol(),
				'opponents'   => $player->getOpponents(),
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
				'board_size'     => $game->getBoardSize(),
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
