import Phaser from 'phaser';

export default class StartMenu extends Phaser.Scene {
  constructor() {
    super('StartMenu');
  }

  create() {
    const width = this.scale.width;

    // Background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Title
    this.add
      .text(width / 2, 100, "Gucci's Adventure", {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Get progress
    const unlockedLevel = parseInt(
      localStorage.getItem('gucci_unlocked_level') || '1',
      10
    );

    // Play Button (Starts highest unlocked)
    const startBtn = this.add
      .text(width / 2, 200, 'PLAY', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#00aa00',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startLevel(unlockedLevel))
      .on('pointerover', () => startBtn.setScale(1.1))
      .on('pointerout', () => startBtn.setScale(1));

    // Level Select Label
    this.add
      .text(width / 2, 300, 'Select Level:', {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Level Buttons
    const levels = [
      { num: 1, key: 'GameScene' },
      { num: 2, key: 'SecondLevel' },
      { num: 3, key: 'ThirdLevel' },
      { num: 4, key: 'FourthLevel' },
      { num: 5, key: 'FifthLevel' },
    ];

    const startX = width / 2 - 120;
    const gap = 60;

    levels.forEach((lvl, index) => {
      const isLocked = lvl.num > unlockedLevel;
      const btnColor = isLocked ? '#555555' : '#0000aa';

      const btn = this.add
        .text(startX + index * gap, 360, `${lvl.num}`, {
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: btnColor,
          padding: { x: 15, y: 10 },
        })
        .setOrigin(0.5);

      if (!isLocked) {
        btn
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.startLevel(lvl.num))
          .on('pointerover', () => btn.setScale(1.1))
          .on('pointerout', () => btn.setScale(1));
      } else {
        btn.setAlpha(0.5);
      }
    });
  }

  private startLevel(levelNum: number) {
    const keys = [
      'GameScene',
      'SecondLevel',
      'ThirdLevel',
      'FourthLevel',
      'FifthLevel',
    ];
    const key = keys[levelNum - 1];

    this.scene.start(key);
  }
}
