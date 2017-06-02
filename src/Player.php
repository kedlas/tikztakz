<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 04/05/2017
 * Time: 22:12
 */

namespace Connect5;

use Ratchet\ConnectionInterface;

class Player
{

	/**
	 * @var ConnectionInterface
	 */
	private $connection;

	/**
	 * @var string
	 */
	private $id;

	/**
	 * @var string
	 */
	private $name;

	/**
	 * @var string
	 */
	private $symbol;

	/**
	 * @var Game
	 */
	private $game;

	/**
	 * Player constructor.
	 *
	 * @param ConnectionInterface $conn
	 * @param string              $name
	 */
	public function __construct(ConnectionInterface $conn, string $name)
	{
		$this->connection = $conn;
		$this->id         = uniqid();
		$this->name       = $name;
	}

	/**
	 * @param string $message
	 */
	public function send(string $message)
	{
		$this->connection->send($message);
	}

	/**
	 * @return string
	 */
	public function getId(): string
	{
		return $this->id;
	}

	/**
	 * @return ConnectionInterface
	 */
	public function getConnection(): ConnectionInterface
	{
		return $this->connection;
	}

	/**
	 * @return string
	 */
	public function getName(): string
	{
		return $this->name;
	}

	/**
	 * @param string $name
	 */
	public function setName(string $name)
	{
		$this->name = $name;
	}

	/**
	 * @return Game
	 */
	public function getGame(): Game
	{
		return $this->game;
	}

	/**
	 * @param Game $game
	 */
	public function setGame(Game $game)
	{
		$this->game = $game;
	}

	/**
	 * @return string
	 */
	public function getSymbol(): string
	{
		return $this->symbol;
	}

	/**
	 * @param string $symbol
	 */
	public function setSymbol(string $symbol)
	{
		$this->symbol = $symbol;
	}

	/**
	 * @return array
	 */
	public function getOpponents(): array
	{
		if (!$this->game) {
			return [];
		}

		$opponents = [];
		foreach ($this->game->getPlayers() as $player) {
			if ($player->getId() === $this->getId()) {
				continue;
			}

			$opponents[] = $player->getName();
		}

		return $opponents;
	}

}
