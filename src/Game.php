<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 04/05/2017
 * Time: 21:22
 */

namespace Connect5;

use Connect5\Exception\LogicException;

class Game
{

	private const MAX_PLAYERS    = 2;
	private const BOARD_SIZE     = 20;
	private const WINNING_STREAK = 5;

	private const SYMBOL_CROSS  = 'X';
	private const SYMBOL_CIRCLE = 'O';

	/**
	 * @var string
	 */
	private $id;

	/**
	 * @var Player[]
	 */
	private $players;

	/**
	 * @var Player
	 */
	private $playerOnTurn;

	/**
	 * @var Player
	 */
	private $winner;

	/**
	 * @var bool
	 */
	private $isEndOfGame = FALSE;

	/**
	 * TODO save to mongo
	 *
	 * @var array
	 */
	private $movesLog = [];

	/**
	 * @var array
	 */
	private $board = [];

	/**
	 * Game constructor.
	 */
	public function __construct()
	{
		$this->id      = uniqid();
		$this->players = [];

		for ($x = 0; $x < self::BOARD_SIZE; $x++) {
			$this->board[$x] = [];
			for ($y = 0; $y < self::BOARD_SIZE; $y++) {
				$this->board[$x][$y] = NULL;
			}
		}
	}

	/**
	 * @return string
	 */
	public function getId(): string
	{
		return $this->id;
	}

	/**
	 * @return bool
	 */
	public function isOpen(): bool
	{
		if (count($this->players) < self::MAX_PLAYERS) {
			return TRUE;
		}

		return FALSE;
	}

	/**
	 * @return bool
	 */
	public function isReady(): bool
	{
		if (count($this->players) === self::MAX_PLAYERS) {
			return TRUE;
		}

		return FALSE;
	}

	/**
	 * @param Player $player
	 */
	public function addPlayer(Player $player)
	{
		if (!$this->isOpen()) {
			throw new LogicException('Cannot add player, game is already full.');
		}

		$symbol = self::SYMBOL_CIRCLE;
		if (count($this->getPlayers()) === 0) {
			$symbol             = self::SYMBOL_CROSS;
			$this->playerOnTurn = $player;
		}

		$player->setSymbol($symbol);

		$this->players[] = $player;
	}

	/**
	 * @param Player $playerToRemove
	 */
	public function removePlayer(Player $playerToRemove)
	{
		/** @var Player $player */
		foreach ($this->players as $key => $player) {
			if ($player === $playerToRemove) {
				unset($this->players[$key]);
			}
		}
	}

	/**
	 * @return Player[]
	 */
	public function getPlayers(): array
	{
		return $this->players;
	}

	/**
	 * @return Player
	 */
	public function getPlayerOnTurn(): Player
	{
		return $this->playerOnTurn;
	}

	/**
	 * @return int
	 */
	public function getBoardSize(): int
	{
		return self::BOARD_SIZE;
	}

	/**
	 *
	 */
	public function close()
	{
		foreach ($this->players as $player) {
			unset($player);
		}
	}

	public function addMove(Player $player, int $x, int $y)
	{
		$key = $x . ':' . $y;
		if ($this->board[$x][$y] !== NULL) {
			throw new LogicException(
				sprintf('Cannot add move to field "%s". Field is not empty.', $key)
			);
		}

		$this->board[$x][$y]  = $player->getSymbol();
		$this->movesLog[$key] = $player->getSymbol();

		if ($this->hasWon($player, $x, $y)) {
			$this->isEndOfGame = TRUE;
			$this->winner      = $player;
		}
		$this->switchPlayerOnTurn();
	}

	/**
	 * @return bool
	 */
	public function isEndOfGame(): bool
	{
		return $this->isEndOfGame;
	}

	/**
	 *
	 */
	private function switchPlayerOnTurn()
	{
		foreach ($this->players as $player) {
			if ($player !== $this->playerOnTurn) {
				$this->playerOnTurn = $player;
				break;
			}
		}
	}

	/**
	 * @param Player $player
	 * @param int    $x
	 * @param int    $y
	 *
	 * @return bool
	 */
	private function hasWon(Player $player, int $x, int $y): bool
	{
		if ($this->hasHorizontalStreak($player, $x, $y) ||
			$this->hasVerticalStreak($player, $x, $y) ||
			$this->hasDiagonalStreak($player, $x, $y)) {
			return TRUE;
		}

		return FALSE;
	}

	/**
	 * @param Player $player
	 * @param int    $x
	 * @param int    $y
	 *
	 * @return bool
	 */
	private function hasHorizontalStreak(Player $player, int $x, int $y): bool
	{
		$streak = 1;
		$length = 1;
		while (isset($this->board[$x - $length][$y]) && $this->board[$x - $length][$y] === $player->getSymbol()) {
			$length++;
			$streak++;
		}

		$length = 1;
		while (isset($this->board[$x + $length][$y]) && $this->board[$x + $length][$y] === $player->getSymbol()) {
			$length++;
			$streak++;
		}

		if ($streak >= self::WINNING_STREAK) {
			return TRUE;
		}

		return FALSE;
	}

	private function hasVerticalStreak(Player $player, int $x, int $y): bool
	{
		$streak = 1;
		$length = 1;
		while (isset($this->board[$x][$y - $length]) && $this->board[$x][$y - $length] === $player->getSymbol()) {
			$length++;
			$streak++;
		}

		$length = 1;
		while (isset($this->board[$x][$y + $length]) && $this->board[$x][$y + $length] === $player->getSymbol()) {
			$length++;
			$streak++;
		}

		if ($streak >= self::WINNING_STREAK) {
			return TRUE;
		}

		return FALSE;
	}

	private function hasDiagonalStreak(Player $player, int $x, int $y): bool
	{
		$streak = 1;
		$length = 1;
		while (
			isset($this->board[$x - $length][$y - $length]) &&
			$this->board[$x - $length][$y - $length] === $player->getSymbol()
		) {
			$length++;
			$streak++;
		}

		$length = 1;
		while (
			isset($this->board[$x + $length][$y + $length]) &&
			$this->board[$x + $length][$y + $length] === $player->getSymbol()
		) {
			$length++;
			$streak++;
		}

		if ($streak >= self::WINNING_STREAK) {
			return TRUE;
		}

		return FALSE;
	}

}
