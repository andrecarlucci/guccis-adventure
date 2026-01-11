import Phaser from 'phaser';
import BaseLevel, { LevelConfig } from './BaseLevel';

export default class Level3 extends BaseLevel {
  constructor() {
    const config: LevelConfig = {
      levelWidth: 4000,
      backgroundColor: '#90EE90', // Light Green
      bossSpeed: 175,
      enemySpeedNormal: 100,
      enemySpeedFast: 180,
      nextLevelKey: 'Level4',
      levelName: 'LEVEL 3',
      levelNumber: 3,
    };
    super('Level3', config);
  }

  // Uses default platform generation from BaseLevel or we can customize
  // Let's customize slightly for variety
  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(this.config.levelWidth / 32, 4.6875)
      .refreshBody();

    // More vertical focus
    for (let x = 300; x < this.config.levelWidth - 200; x += 250) {
      // Vary height more
      const y = Phaser.Math.Between(100, 500);
      this.platforms.create(x, y, 'ground').setScale(2, 1).refreshBody(); // Smaller platforms
    }
  }
}
