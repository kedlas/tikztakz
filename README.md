Connect5 game

- implemented via http websockets in PHP (Ratchet) and client side js
- author (c) Kedlas
- Pull requests are welcome

How to run this app:

```
1. clone this repo to your local machine with docker installed
2. docker build -t connect5image .
3. docker rm -f connect5
4. docker run -d -p 8080:8080 -v `pwd`:/app --name connect5 connect5image
5. set server's ip address to your docker machine ip address on the 1st line of js/conect5.js (e.g. use docker-machine ip command)
6. open the index.html file in two browser windows and enjoy the game
```
git
Game begins whenever 2 players join the game by filling their names.
The server will connect these 2 players and creates a new game board for them.
Players place their own marks to the game board and try to create line of 5 symbols in ine column, row or diagonals.
Game end when the player manages to make 5 marks in line. 

![alt text](https://github.com/kedlas/connect5sockets/blob/master/connect5-screenshot.png)
