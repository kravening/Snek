var game;

game = new Phaser.Game(800, 800, Phaser.AUTO, '');

game.state.add('Menu', Menu);

game.state.add('Game', Game);

game.state.start('Menu');