import Phaser from 'phaser';
import BaseLevel, { LevelConfig } from './BaseLevel';

export default class Level4 extends BaseLevel {
  constructor() {
    const config: LevelConfig = {
      levelWidth: 4000,
      backgroundColor: '#FFA07A', // Light Salmon
      bossSpeed: 200,
      enemySpeedNormal: 120,
      enemySpeedFast: 200,
      nextLevelKey: 'Level5',
      levelName: 'LEVEL 4',
      levelNumber: 4,
    };
    super('Level4', config);
  }

  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(this.config.levelWidth / 32, 4.6875)
      .refreshBody();

    // Variable spacing
    for (
      let x = 300;
      x < this.config.levelWidth - 200;
      x += Phaser.Math.Between(200, 400)
    ) {
      const y = Phaser.Math.Between(200, 450);
      this.platforms
        .create(x, y, 'ground')
        .setScale(Phaser.Math.Between(2, 4), 1)
        .refreshBody();
    }
  }
}
