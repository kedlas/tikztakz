<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 11/06/2017
 * Time: 09:55
 */

namespace Test\Connect5;

use Connect5\Exception\LogicException;
use Connect5\MessageRouter;
use PHPUnit\Framework\TestCase;
use Ratchet\ConnectionInterface;

class MessageRouterTest extends TestCase
{

	/**
	 * @covers MessageRouter::handleMessage()
	 */
	public function testHandleMessageOnUnknownMessageType()
	{
		$router = new MessageRouter();
		$this->expectException(LogicException::class);
		$this->expectExceptionCode(LogicException::INVALID_MESSAGE);
		$router->handleMessage(
			$this->createMock(ConnectionInterface::class),
			'some unknown type',
			[]
		);
	}

}
