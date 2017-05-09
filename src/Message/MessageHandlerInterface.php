<?php
/**
 * Created by PhpStorm.
 * User: Tomas Sedlacek
 * Mail: mail@kedlas.cz
 * Date: 07/05/2017
 * Time: 10:41
 */

namespace Connect5\Message;

use Ratchet\ConnectionInterface;

interface MessageHandlerInterface
{

	/**
	 * @param ConnectionInterface $conn
	 * @param array               $data
	 *
	 * @return
	 */
	public function validate(ConnectionInterface $conn, array $data);

	/**
	 * @param ConnectionInterface $conn
	 * @param array               $data
	 *
	 * @return mixed
	 */
	public function processMessage(ConnectionInterface $conn, array $data);

}
