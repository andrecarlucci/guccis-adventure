import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  private cat?: Phaser.GameObjects.Graphics;
  constructor() {
    super('Preloader');
  }

  preload() {
    // Create simple graphics for placeholders
    // 1. Cat Sprite Sheet (128x32 - 4 frames of 32x32)
    // Frame 0: Idle, Frame 1: Walk 1, Frame 2: Walk 2, Frame 3: Jump
    this.createCatGraphics();

    // 2. Dog: Brownish
    this.createDogGraphics();

    // 3. Boss: Big Red
    this.createBossGraphics();

    // 4. Treat: Pink/Yellow glow
    this.createTreatGraphics();

    // 5. Key: Gold
    this.createKeyGraphics();

    // 6. Unicorn: White with Rainbow horn (Simplified to Purple for now)
    this.createUnicornGraphics();

    // 7. Cage: Grey bars
    this.createCageGraphics();

    // 8. Ground: Green
    this.createGroundGraphics();

    // 9. Tornado: Blue swirl
    this.createTornadoGraphics();
  }

  private createTornadoGraphics() {
    const tornado = this.make.graphics({ x: 0, y: 0 });
    tornado.fillStyle(0x00ffff, 0.5);
    tornado.fillCircle(24, 24, 24);
    tornado.generateTexture('tornado', 48, 48);
    tornado.destroy();
  }

  private createGroundGraphics() {
    const ground = this.make.graphics({ x: 0, y: 0 });
    ground.fillStyle(0x66cc66, 1);
    ground.fillRect(0, 0, 32, 32);
    ground.generateTexture('ground', 32, 32);
    ground.destroy();
  }

  private createCageGraphics() {
    const cage = this.make.graphics({ x: 0, y: 0 });
    cage.lineStyle(2, 0x000000, 1);
    cage.strokeRect(0, 0, 48, 48);
    cage.beginPath();
    cage.moveTo(16, 0);
    cage.lineTo(16, 48);
    cage.moveTo(32, 0);
    cage.lineTo(32, 48);
    cage.strokePath();
    cage.generateTexture('cage', 48, 48);
    cage.destroy();
  }

  private createUnicornGraphics() {
    const unicorn = this.make.graphics({ x: 0, y: 0 });
    unicorn.fillStyle(0xe6e6fa, 1); // Lavender
    unicorn.fillRect(0, 0, 32, 32);
    unicorn.fillStyle(0xff00ff, 1); // Horn
    unicorn.fillRect(12, -8, 4, 8);
    unicorn.generateTexture('unicorn', 32, 40);
    unicorn.destroy();
  }

  private createKeyGraphics() {
    const key = this.make.graphics({ x: 0, y: 0 });
    key.fillStyle(0xffd700, 1);
    key.fillRect(0, 0, 16, 8);
    key.generateTexture('key', 16, 8);
    key.destroy();
  }

  private createTreatGraphics() {
    const treat = this.make.graphics({ x: 0, y: 0 });
    treat.fillStyle(0xff69b4, 1);
    treat.fillCircle(8, 8, 8);
    treat.generateTexture('treat', 16, 16);
    treat.destroy();
  }

  private createBossGraphics() {
    const boss = this.make.graphics({ x: 0, y: 0 });
    const drawBoss = (mouthOpen: boolean) => {
      boss.fillStyle(0xff0000, 1);
      boss.fillRect(0, 0, 64, 64);
      // Eyes
      boss.fillStyle(0xffff00, 1);
      boss.fillRect(10, 10, 16, 16); // Big yellow eyes
      boss.fillRect(38, 10, 16, 16);
      // Pupils
      boss.fillStyle(0x000000, 1);
      boss.fillRect(14, 14, 4, 4);
      boss.fillRect(42, 14, 4, 4);

      // Mouth
      boss.fillStyle(0x000000, 1);
      if (mouthOpen) {
        boss.fillRect(10, 40, 44, 20); // Open

        // Teeth
        boss.fillStyle(0xffffff, 1);
        boss.fillRect(12, 40, 8, 8);
        boss.fillRect(44, 40, 8, 8);
      } else {
        boss.fillRect(10, 50, 44, 10); // Closed

        // Teeth poking out
        boss.fillStyle(0xffffff, 1);
        boss.fillRect(14, 52, 6, 6);
        boss.fillRect(44, 52, 6, 6);
      }
    };

    boss.clear();
    drawBoss(false);
    boss.generateTexture('boss_idle1', 64, 64);

    boss.clear();
    drawBoss(true);
    boss.generateTexture('boss_idle2', 64, 64);
    boss.destroy();
  }

  private createDogGraphics() {
    const dog = this.make.graphics({ x: 0, y: 0 });
    const drawDog = (legOffset: number) => {
      // Body
      dog.fillStyle(0x8b4513, 1);
      dog.fillRect(0, 0, 32, 24);
      // Head (Darker)
      dog.fillStyle(0x5a2d0c, 1);
      dog.fillRect(0, -8, 12, 12);
      // Legs
      dog.fillStyle(0x8b4513, 1);
      dog.fillRect(4 + legOffset, 24, 6, 6);
      dog.fillRect(22 - legOffset, 24, 6, 6);
    };

    dog.clear();
    drawDog(2);
    dog.generateTexture('dog_walk1', 32, 30);

    dog.clear();
    drawDog(-2);
    dog.generateTexture('dog_walk2', 32, 30);
    dog.destroy();
  }

  private createCatGraphics() {
    this.cat = this.make.graphics({ x: 0, y: 0 });

    // Frame 0: Idle
    this.cat.clear();
    this.drawTheCat(this.cat, 0, 0, false);
    this.cat.generateTexture('cat_idle', 32, 40);

    // Frame 1: Walk 1
    this.cat.clear();
    this.drawTheCat(this.cat, 0, 4, false);
    this.cat.generateTexture('cat_walk1', 32, 40);

    // Frame 2: Walk 2
    this.cat.clear();
    this.drawTheCat(this.cat, 0, -4, false);
    this.cat.generateTexture('cat_walk2', 32, 40);

    // Frame 3: Jump
    this.cat.clear();
    this.drawTheCat(this.cat, 0, 0, true);
    this.cat.generateTexture('cat_jump', 32, 40);

    this.cat.destroy();
  }

  private drawTheCat(
    cat: Phaser.GameObjects.Graphics,
    xOffset: number,
    legOffset: number,
    isJump: boolean
  ) {
    const yBase = 8; // Shift down to make room for ears

    // Body
    cat.fillStyle(0xffffff, 1);
    cat.fillRect(xOffset, yBase, 32, 24); // Body

    // Head/Ears
    cat.beginPath();
    cat.moveTo(xOffset + 2, yBase);
    cat.lineTo(xOffset + 8, yBase - 6);
    cat.lineTo(xOffset + 14, yBase); // Left Ear
    cat.moveTo(xOffset + 18, yBase);
    cat.lineTo(xOffset + 24, yBase - 6);
    cat.lineTo(xOffset + 30, yBase); // Right Ear
    cat.fillPath();

    // Eyes
    cat.fillStyle(0x8899cc, 1);
    cat.fillRect(xOffset + 8, yBase + 8, 4, 4);
    cat.fillRect(xOffset + 20, yBase + 8, 4, 4);

    // Legs
    cat.fillStyle(0xffffff, 1);
    if (isJump) {
      // Jump legs (splayed)
      cat.fillRect(xOffset + 2, yBase + 24, 6, 8); // Back leg
      cat.fillRect(xOffset + 24, yBase + 20, 6, 8); // Front leg high
    } else {
      // Walk legs
      cat.fillRect(xOffset + 4 + legOffset, yBase + 24, 6, 8); // Leg 1
      cat.fillRect(xOffset + 22 - legOffset, yBase + 24, 6, 8);
    }
  }

  create() {
    // Create animations
    this.anims.create({
      key: 'cat-idle',
      frames: [{ key: 'cat_idle' }],
      frameRate: 10,
    });

    this.anims.create({
      key: 'cat-walk',
      frames: [{ key: 'cat_walk1' }, { key: 'cat_walk2' }],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'cat-jump',
      frames: [{ key: 'cat_jump' }],
      frameRate: 10,
    });

    this.anims.create({
      key: 'dog-walk',
      frames: [{ key: 'dog_walk1' }, { key: 'dog_walk2' }],
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'boss-idle',
      frames: [{ key: 'boss_idle1' }, { key: 'boss_idle2' }],
      frameRate: 3,
      repeat: -1,
    });

    this.scene.start('StartMenu');
  }
}
