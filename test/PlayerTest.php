<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 08/06/2017
 * Time: 14:11
 */

namespace Test\Connect5;

use Connect5\Game;
use Connect5\Player;
use PHPUnit\Framework\TestCase;
use Ratchet\ConnectionInterface;

/**
 * Class PlayerTest
 *
 * @package Test\Connect5
 */
class PlayerTest extends TestCase
{

	/**
	 * @covers Player::getOpponents()
	 */
	public function testGetOpponentsWhenNoGame()
	{
		$player = new Player($this->createMock(ConnectionInterface::class), 'Player name');
		$this->assertCount(0, $player->getOpponents());
	}

	/**
	 * @covers Player::getOpponents()
	 */
	public function testGetOpponentsWhenOnlySelfInGame()
	{
		$game = new Game();
		$player = new Player($this->createMock(ConnectionInterface::class), 'Player name');
		$game->addPlayer($player);
		$player->setGame($game);
		$this->assertCount(0, $player->getOpponents());
	}

	/**
	 * @covers Player::getOpponents()
	 */
	public function testGetOpponents()
	{
		$game = new Game();
		$player = new Player($this->createMock(ConnectionInterface::class), 'Player');
		$opponent = new Player($this->createMock(ConnectionInterface::class), 'Opponent');
		$game->addPlayer($player);
		$game->addPlayer($opponent);
		$player->setGame($game);
		$this->assertCount(1, $player->getOpponents());
	}
	
}
