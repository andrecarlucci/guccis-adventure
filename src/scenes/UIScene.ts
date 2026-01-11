import Phaser from 'phaser';
import Level1 from './Level1';

export default class UIScene extends Phaser.Scene {
  private healthBars: Phaser.GameObjects.Rectangle[] = [];
  private treatText!: Phaser.GameObjects.Text;
  private powerBar!: Phaser.GameObjects.Rectangle;
  private powerTween?: Phaser.Tweens.Tween;

  private bossHealthContainer!: Phaser.GameObjects.Container;
  private bossHealthBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('UIScene');
  }

  create(data: { gameScene?: Phaser.Scene }) {
    // Ensure multi-touch is supported
    this.input.addPointer(3);

    // Health Bars
    this.add.text(10, 10, 'Health:', { fontSize: '16px', color: '#ffffff' });
    for (let i = 0; i < 5; i++) {
      const bar = this.add.rectangle(80 + i * 25, 18, 20, 10, 0xff0000);
      this.healthBars.push(bar);
    }

    // Treats / Power
    this.treatText = this.add.text(10, 40, 'Treats: 0', {
      fontSize: '16px',
      color: '#ffffff',
    });
    this.add.text(10, 70, 'Super Power:', {
      fontSize: '16px',
      color: '#ffffff',
    });
    this.powerBar = this.add.rectangle(120, 78, 0, 10, 0x00ffff);
    this.powerBar.setOrigin(0, 0.5);

    // Boss Health Bar (Top Right)
    this.bossHealthContainer = this.add.container(780, 20); // Anchor Right
    // Label
    const bossLabel = this.add.text(-100, 0, 'BOSS', {
      fontSize: '16px',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    bossLabel.setOrigin(1, 0);
    // Bar Background
    const bossBg = this.add.rectangle(0, 8, 104, 14, 0x000000);
    bossBg.setOrigin(1, 0.5);
    // Bar Fill
    this.bossHealthBar = this.add.rectangle(-2, 8, 100, 10, 0xff0000);
    this.bossHealthBar.setOrigin(1, 0.5);

    this.bossHealthContainer.add([bossLabel, bossBg, this.bossHealthBar]);
    this.bossHealthContainer.setVisible(false);

    // Level Label (Top Middle)
    this.levelLabel = this.add.text(400, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });
    this.levelLabel.setOrigin(0.5, 0);
    this.levelLabel.setInteractive({ useHandCursor: true });

    this.levelLabel.on('pointerdown', () => {
      // Use a slight delay or just confirm immediately.
      // Note: confirm blocks execution.
      if (window.confirm('Are you sure you want to exit?')) {
        // Stop the Game Logic Scene if we can find it, although StartMenu might handle clean up,
        // it's safer to stop all scenes or just switch to StartMenu which is usually a single scene state.
        // Effectively, we want to reset to StartMenu.
        // We can use the Scene Manager to stop all key scenes.

        const activeScenes = this.scene.manager.getScenes(true);
        for (const scene of activeScenes) {
          if (scene.scene.key !== 'UIScene') {
            // Stop the game level
            scene.scene.stop();
          }
        }
        this.scene.start('StartMenu');
      }
    });

    // Connect if passed in data
    if (data && data.gameScene) {
      this.connectScene(data.gameScene);
    }
  }

  private levelLabel!: Phaser.GameObjects.Text;
  private currentLevelScene?: Phaser.Scene;

  public connectScene(gameScene: any) {
    this.currentLevelScene = gameScene;

    // Safety check just in case connectScene is called before create completes
    // (though our new logic prevents that, redundant safety is good)
    if (!this.levelLabel) {
      return;
    } else {
      this.levelLabel.setText('Level');
    }

    gameScene.events.on('health-changed', this.updateHealth, this);
    gameScene.events.on('treats-changed', this.updateTreats, this);
    gameScene.events.on('power-changed', this.updatePower, this);
    gameScene.events.on('power-active', this.showPowerActive, this);
    gameScene.events.on('boss-active', this.showBossHealth, this);
    gameScene.events.on('boss-health', this.updateBossHealth, this);

    if (this.isMobile()) {
      this.createVirtualControls(gameScene);
    }
  }

  private isMobile() {
    // Build generic check for mobile devices
    const os = this.sys.game.device.os;
    return os.android || os.iOS || os.iPad || os.iPhone || os.windowsPhone;
  }

  private createVirtualControls(gameScene: any) {
    // Left Side: Left, Right, Up
    // Positioning: Bottom Left roughly
    // Left
    this.createBtn(
      50,
      520,
      '<',
      () => gameScene.setPlayerMoveLeft(true),
      () => gameScene.setPlayerMoveLeft(false)
    );
    // Right
    this.createBtn(
      150,
      520,
      '>',
      () => gameScene.setPlayerMoveRight(true),
      () => gameScene.setPlayerMoveRight(false)
    );

    // Right Side: Jump, Superpower
    // Positioning: Bottom Right roughly
    // Jump
    this.createBtn(700, 520, 'Jump', () => gameScene.playerJump());

    // Power (Left of Jump)
    this.createBtn(600, 520, 'Pow', () => gameScene.playerPower());
  }

  private createBtn(
    x: number,
    y: number,
    text: string,
    onDown: () => void,
    onUp?: () => void
  ) {
    // Increase size for easier touch (Radius 50 = 100px diameter)
    const bg = this.add.circle(x, y, 50, 0xffffff, 0.5).setInteractive();
    // Ensure buttons are above other UI if needed, but UI Scene is top
    this.add
      .text(x, y, text, { fontSize: '20px', color: '#000', fontStyle: 'bold' })
      .setOrigin(0.5);

    bg.on('pointerdown', onDown);
    if (onUp) {
      bg.on('pointerup', onUp);
      bg.on('pointerout', onUp);
    }
  }

  private updateHealth(currentHealth: number) {
    if (!this.healthBars || this.healthBars.length === 0) return;
    // Show/hide bars based on current health
    this.healthBars.forEach((bar, index) => {
      bar.setVisible(index < currentHealth);
    });
  }

  private updateTreats(count: number) {
    if (!this.treatText) return;
    this.treatText.setText(`Treats: ${count}`);
  }

  private updatePower(count: number) {
    if (!this.powerBar) return;
    // Max width for power bar is 100. Max count is 5.
    const width = (Math.min(count, 5) / 5) * 100;
    this.powerBar.width = width;

    if (count >= 5) {
      if (!this.powerTween) {
        this.powerTween = this.tweens.add({
          targets: this.powerBar,
          alpha: 0,
          duration: 200,
          ease: 'Linear',
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      if (this.powerTween) {
        this.powerTween.stop();
        this.powerTween = undefined;
      }
      this.powerBar.setAlpha(1);
    }
  }

  private showPowerActive(active: boolean) {
    if (!this.powerBar) return;
    if (active) {
      this.powerBar.fillColor = 0x00ff00; // Green when active? Or keep cyan?
      // Actually it goes to 0 immediately, so bar is empty.
      // Maybe flash text?
    } else {
      this.powerBar.fillColor = 0x00ffff;
    }
  }

  private showBossHealth(visible: boolean) {
    if (!this.bossHealthContainer) return;
    this.bossHealthContainer.setVisible(visible);
    if (visible) {
      // Reset full bar
      this.bossHealthBar.width = 100;
    }
  }

  private updateBossHealth(current: number) {
    if (!this.bossHealthBar) return;
    // Max 6
    const pct = Math.max(0, current / 6);
    this.bossHealthBar.width = pct * 100;
  }
}
