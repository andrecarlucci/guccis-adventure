import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import StartMenu from './scenes/StartMenu';
import GameScene from './scenes/Level1';
import SecondLevel from './scenes/Level2';
import Level3 from './scenes/Level3';
import Level4 from './scenes/Level4';
import Level5 from './scenes/FifthLevel';
import UIFromScene from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false,
    },
  },
  scene: [
    Preloader,
    StartMenu,
    GameScene,
    SecondLevel,
    Level3,
    Level4,
    Level5,
    UIFromScene,
  ],
  parent: 'app',
  backgroundColor: '#87CEEB', // Sky blue for a cute colorful vibe
};

export default new Phaser.Game(config);
