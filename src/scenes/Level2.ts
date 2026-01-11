import Phaser from 'phaser';
import BaseLevel, { LevelConfig } from './BaseLevel';

export default class Level2 extends BaseLevel {
  constructor() {
    const config: LevelConfig = {
      levelWidth: 4000,
      backgroundColor: '#ff94f6',
      bossSpeed: 150,
      enemySpeedNormal: 80,
      enemySpeedFast: 150,
      nextLevelKey: 'ThirdLevel',
      levelName: 'LEVEL 2',
      levelNumber: 2,
    };
    super('Level2', config);
  }

  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Ground floor
    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(this.config.levelWidth / 32, 4.6875)
      .refreshBody();

    // Specific L2 Platforms
    this.platforms.create(300, 350, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(600, 250, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(900, 350, 'ground').setScale(3, 1).refreshBody();

    // Higher platforms
    this.platforms.create(1100, 150, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(1500, 450, 'ground').setScale(3, 1).refreshBody();

    // Generative with 300 step (denser)
    for (let x = 1200; x < this.config.levelWidth - 200; x += 300) {
      const y = Phaser.Math.Between(150, 400);
      this.platforms.create(x, y, 'ground').setScale(3, 1).refreshBody();
    }
  }
}
