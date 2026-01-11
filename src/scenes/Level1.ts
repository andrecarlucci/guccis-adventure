import Phaser from 'phaser';
import BaseLevel, { LevelConfig } from './BaseLevel';

export default class Level1 extends BaseLevel {
  constructor() {
    const config: LevelConfig = {
      levelWidth: 4000,
      backgroundColor: '#87CEEB',
      bossSpeed: 125,
      enemySpeedNormal: 50,
      enemySpeedFast: 100,
      nextLevelKey: 'SecondLevel',
      levelName: 'LEVEL 1',
      levelNumber: 1,
    };
    super('Level1', config);
  }

  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Ground floor
    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(this.config.levelWidth / 32, 4.6875)
      .refreshBody();

    // Specific L1 Platforms
    this.platforms.create(300, 350, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(600, 250, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(900, 350, 'ground').setScale(3, 1).refreshBody();

    // Generative with 500 step
    for (let x = 1200; x < this.config.levelWidth - 200; x += 500) {
      const y = Phaser.Math.Between(250, 400);
      this.platforms.create(x, y, 'ground').setScale(3, 1).refreshBody();
    }
  }
}
