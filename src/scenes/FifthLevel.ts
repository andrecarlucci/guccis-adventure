import Phaser from 'phaser';
import BaseLevel, { LevelConfig } from './BaseLevel';

export default class Level5 extends BaseLevel {
  constructor() {
    const config: LevelConfig = {
      levelWidth: 4000,
      backgroundColor: '#D8BFD8', // Thistle
      bossSpeed: 225,
      enemySpeedNormal: 150,
      enemySpeedFast: 250,
      nextLevelKey: undefined, // Last level
      levelName: 'LEVEL 5',
      levelNumber: 5,
    };
    super('Level5', config);
  }

  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(this.config.levelWidth / 32, 4.6875)
      .refreshBody();

    // Harder jumps
    for (
      let x = 300;
      x < this.config.levelWidth - 200;
      x += Phaser.Math.Between(300, 500)
    ) {
      const y = Phaser.Math.Between(150, 450);
      this.platforms.create(x, y, 'ground').setScale(2, 1).refreshBody();
    }
  }
}
