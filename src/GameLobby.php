<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 04/05/2017
 * Time: 21:11
 */

namespace Connect5;

use LogicException;
use Ratchet\ConnectionInterface;

class GameLobby
{

	const ADD_MOVE_KEY = 'add_move';

	/**
	 * @var Game[]
	 */
	protected $games = [];

	/**
	 * @var Player[]
	 */
	private $players = [];

	/**
	 * @param ConnectionInterface $conn
	 * @param string              $name
	 *
	 * @return Player
	 */
	public function createPlayer(ConnectionInterface $conn, string $name)
	{
		$player = new Player($conn, $name);

		$this->players[$conn->resourceId] = $player;

		return $player;
	}

	/**
	 * @param ConnectionInterface $connection
	 *
	 * @return Player|null
	 */
	public function findPlayer(ConnectionInterface $connection): ?Player
	{
		if (isset($this->players[$connection->resourceId]) &&
			$this->players[$connection->resourceId] instanceof Player
		) {
			return $this->players[$connection->resourceId];
		}

		return NULL;
	}

	/**
	 * @param ConnectionInterface $conn
	 */
	public function deletePlayer(ConnectionInterface $conn)
	{
		if (array_key_exists($conn->resourceId, $this->players)) {
			$player = $this->players[$conn->resourceId];
			echo sprintf('Player "%s" has been deleted from game "%s"', $player->getId(), $player->getGame()->getId());

			unset($this->players[$conn->resourceId]);
		}
	}

	/**
	 * @param Game $game
	 */
	public function deleteGame(Game $game)
	{
		foreach ($game->getPlayers() as $player) {
			$this->deletePlayer($player->getConnection());
		}

		if (array_key_exists($game->getId(), $this->games)) {
			echo sprintf('Game "%s" has been deleted', $player->getGame()->getId());
			unset($this->games[$game->getId()]);
		}
	}

	/**
	 * @param string $id
	 *
	 * @return Game|null
	 */
	public function findGame(string $id): ? Game
	{
		if (isset($this->games[$id])) {
			return $this->games[$id];
		}

		return NULL;
	}

	/**
	 * @return Game
	 */
	public function getRandomPublicGame(): Game
	{
		// Find public game where some player waits for opponent first
		foreach ($this->games as $game) {
			if ($game->isPublic() && $game->isOpen()) {
				return $game;
			}
		}

		$game = new Game();

		$this->games[$game->getId()] = $game;

		return $game;
	}

	/**
	 * @return Game
	 */
	public function createPrivateGame(): Game
	{
		$game = new Game();
		$game->setPublic(FALSE);

		$this->games[$game->getId()] = $game;

		return $game;
	}

	/**
	 * @param Player $player
	 * @param string $message
	 */
	public function notifyPlayer(Player $player, string $message)
	{
		$player->send($message);
	}

	/**
	 * @param Game   $game
	 * @param string $message
	 */
	public function notifyAllPlayers(Game $game, string $message)
	{
		/** @var Player $player */
		foreach ($game->getPlayers() as $player) {
			$player->send($message);
		}
	}

	/**
	 * @param Player $sender
	 * @param Game   $game
	 * @param string $message
	 */
	public function notifyOtherPlayers(Player $sender, Game $game, string $message)
	{
		/** @var Player $player */
		foreach ($game->getPlayers() as $player) {
			if ($sender !== $player) {
				$player->send($message);
			}
		}
	}

}
