<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 08/06/2017
 * Time: 06:19
 */

namespace Test\Connect5;

use Connect5\Server;
use PHPUnit\Framework\TestCase;
use Ratchet\ConnectionInterface;

class ServerTest extends TestCase
{

	/**
	 * @var Server
	 */
	private $server;

	/**
	 * Prepare server instance
	 */
	public function setUp()
	{
		$this->server = new Server();
	}

	/**
	 * @covers Server::onMessage()
	 */
	public function testOnMessageInvalidMessage()
	{
		$conn = $this->createMock(ConnectionInterface::class);
		$conn->method('send')->willReturnCallback(function ($msg) {
			$msg = json_decode($msg, TRUE);
			$this->assertEquals('error', $msg['type']);
			$this->assertEquals('Invalid message. Error: Syntax error', $msg['data']['message']);
		});

		$this->server->onMessage($conn, 'some: invalid JS');
	}

}
