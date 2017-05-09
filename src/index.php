<?php
use Connect5\Server;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

$loader = require dirname(__DIR__) . '/vendor/autoload.php';

$server = IoServer::factory(
	new HttpServer(
		new WsServer(
			new Server()
		)
	),
	8080
);

$server->run();
