import Phaser from 'phaser';
import Player from '../objects/Player';

export interface LevelConfig {
  levelWidth: number;
  backgroundColor: string | number;
  bossSpeed: number;
  enemySpeedNormal: number;
  enemySpeedFast: number;
  nextLevelKey?: string;
  levelName: string;
  levelNumber: number;
}

export default class BaseLevel extends Phaser.Scene {
  protected player!: Player;
  protected platforms!: Phaser.Physics.Arcade.StaticGroup;
  protected treats!: Phaser.Physics.Arcade.Group;
  protected enemies!: Phaser.Physics.Arcade.Group;
  protected boss!: Phaser.Physics.Arcade.Sprite;
  protected bossHealth = 6;
  protected bossEngaged = false;
  protected keyObj!: Phaser.Physics.Arcade.Sprite;
  protected hasKey = false;
  protected unicorn!: Phaser.Physics.Arcade.Sprite;
  protected cage!: Phaser.Physics.Arcade.Image;
  protected isGameOver = false;

  protected config: LevelConfig;

  constructor(key: string, config: LevelConfig) {
    super(key);
    this.config = config;
  }

  create() {
    this.isGameOver = false;
    this.bossHealth = 6;
    this.bossEngaged = false;
    this.hasKey = false;

    // World bounds
    this.physics.world.setBounds(0, 0, this.config.levelWidth, 600);
    this.cameras.main.setBounds(0, 0, this.config.levelWidth, 600);
    this.cameras.main.setBackgroundColor(this.config.backgroundColor);

    this.createPlatforms();
    this.createPlayer();
    this.createEnemies();
    this.createCollectibles();
    this.createBossSection();

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // Collisions and Overlaps
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.collider(this.keyObj, this.platforms);
    this.physics.add.collider(this.unicorn, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.treats,
      this.handleCollectTreat,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHitEnemy,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.boss,
      this.handleHitBoss,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.keyObj,
      this.handleCollectKey,
      undefined,
      this
    );
    this.physics.add.collider(
      this.player,
      this.cage,
      this.handleTouchCage,
      undefined,
      this
    );

    // Spawn dog timer
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnDog,
      callbackScope: this,
      loop: true,
    });

    // Connect to UI
    // Ensure UI is running and connected
    if (this.scene.isActive('UIScene')) {
      // If already running, we need to explicitly connect because launch wont trigger create()
      const uiScene = this.scene.get('UIScene') as any;
      uiScene.connectScene(this);
    } else {
      // If not running, launch it and pass ourselves as data
      this.scene.launch('UIScene', { gameScene: this });
    }

    this.events.emit('boss-active', false);
  }

  update() {
    if (this.player) {
      this.player.update();
      if (this.player.y > 600 && !this.isGameOver) {
        this.scene.restart();
      }
    }

    if (this.boss && this.boss.active) {
      const inCamera = this.cameras.main.worldView.contains(
        this.boss.x,
        this.boss.y
      );
      if (inCamera) {
        if (!this.bossEngaged) {
          this.bossEngaged = true;
          this.events.emit('boss-active', true);
          this.events.emit('boss-health', this.bossHealth);
        }

        // Movement Logic
        const playerOnGround = this.player.body?.touching.down;
        if (playerOnGround) {
          if (this.boss.x > this.player.x) {
            this.boss.setVelocityX(-this.config.bossSpeed);
            this.boss.setFlipX(false);
          } else {
            this.boss.setVelocityX(this.config.bossSpeed);
            this.boss.setFlipX(true);
          }
        }
      } else {
        this.boss.setVelocityX(0);
        if (this.bossEngaged) {
          this.bossEngaged = false;
          this.events.emit('boss-active', false);
        }
      }
    }

    if (this.enemies) {
      this.enemies.getChildren().forEach((child) => {
        const dog = child as Phaser.Physics.Arcade.Sprite;
        if (dog.active && this.player && !this.isGameOver) {
          const dist = Phaser.Math.Distance.Between(
            dog.x,
            dog.y,
            this.player.x,
            this.player.y
          );
          if (dist < 800) {
            const isFast = dog.getData('isFast');
            const speed = isFast
              ? this.config.enemySpeedFast
              : this.config.enemySpeedNormal;

            const playerOnGround = this.player.body?.touching.down;
            if (playerOnGround) {
              if (dog.x > this.player.x) {
                dog.setVelocityX(-speed);
                dog.setFlipX(false);
              } else {
                dog.setVelocityX(speed);
                dog.setFlipX(true);
              }
            }

            if (dog.body?.touching.down) {
              this.checkDogEdges(dog);
            }
          }
        }
      });
    }
  }

  // Can be overridden
  protected createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    // Default platform generation if not overridden
    const widthC = this.config.levelWidth / 32;

    this.platforms
      .create(0, 600, 'ground')
      .setOrigin(0, 1)
      .setScale(widthC, 4.6875) // Using calculated scale
      .refreshBody();

    // Random platforms
    for (let x = 300; x < this.config.levelWidth - 200; x += 300) {
      const y = Phaser.Math.Between(150, 450);
      this.platforms.create(x, y, 'ground').setScale(3, 1).refreshBody();
    }
  }

  protected createPlayer() {
    this.player = new Player(this, 100, 400);
    this.player.events.on('health-changed', (h: number) =>
      this.events.emit('health-changed', h)
    );
    this.player.events.on('treats-changed', (t: number) =>
      this.events.emit('treats-changed', t)
    );
    this.player.events.on('power-active', (a: boolean) =>
      this.events.emit('power-active', a)
    );
    this.player.events.on('power-changed', (p: number) =>
      this.events.emit('power-changed', p)
    );
    this.player.events.on('died', () => {
      this.isGameOver = true;
      this.cameras.main.stopFollow();
      const text = this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          'GAME OVER',
          {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
          }
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

      const restartKey = this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      restartKey.once('down', () => this.scene.restart());
    });
  }

  protected createEnemies() {
    this.enemies = this.physics.add.group({
      bounceX: 1,
      bounceY: 0,
      collideWorldBounds: true,
    });
    // Initial dogs
    const dogPositions = [400, 700, 1000];
    for (let x = 1300; x < this.config.levelWidth - 500; x += 400) {
      dogPositions.push(x + Phaser.Math.Between(-50, 50));
    }
    dogPositions.forEach((x) => this.spawnDogAt(x, 415)); // Approx ground
  }

  protected spawnDogAt(x: number, y: number) {
    const dog = this.enemies.create(
      x,
      y,
      'dog_walk1'
    ) as Phaser.Physics.Arcade.Sprite;
    dog.play('dog-walk');
    const isFast = Phaser.Math.Between(0, 1) === 1;
    if (isFast) {
      dog.setData('isFast', true);
      dog.setTint(0x999999);
    } else {
      dog.setData('isFast', false);
    }
    dog.setVelocityX(isFast ? -100 : -50);
    dog.setCollideWorldBounds(true);
  }

  protected spawnDog() {
    if (this.isGameOver) return;
    const platforms =
      this.platforms.getChildren() as Phaser.Physics.Arcade.Sprite[];
    if (platforms.length === 0) return;
    const p = Phaser.Utils.Array.GetRandom(platforms);
    let spawnX = p.x;
    let spawnY = p.y - 50;
    if (p.displayWidth > 400) {
      spawnX = Phaser.Math.Between(300, this.config.levelWidth - 500);
      spawnY = 400;
    }
    this.spawnDogAt(spawnX, spawnY);
  }

  protected createCollectibles() {
    this.treats = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    // Random treats
    for (let x = 300; x < this.config.levelWidth - 500; x += 150) {
      if (Phaser.Math.Between(0, 10) > 3) continue; // Not everywhere
      this.treats.create(x, Phaser.Math.Between(200, 350), 'treat');
    }
  }

  protected createBossSection() {
    const bossX = this.config.levelWidth - 200;
    this.boss = this.physics.add.sprite(bossX, 350, 'boss_idle1');
    this.boss.play('boss-idle');
    this.boss.setCollideWorldBounds(true);
    this.boss.setBounce(0.2);

    this.keyObj = this.physics.add.sprite(bossX, 350, 'key');
    this.keyObj.disableBody(true, true);

    const goalX = this.config.levelWidth - 100;
    this.unicorn = this.physics.add.sprite(goalX, 420, 'unicorn');
    (this.unicorn.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.cage = this.physics.add.staticImage(goalX, 420, 'cage');
  }

  protected checkDogEdges(dog: Phaser.Physics.Arcade.Sprite) {
    const velocityX = dog.body?.velocity.x || 0;
    if (velocityX === 0) return;
    const isMovingRight = velocityX > 0;
    const checkX = isMovingRight
      ? dog.x + dog.displayWidth / 2 + 5
      : dog.x - dog.displayWidth / 2 - 5;
    const checkY = dog.y + dog.displayHeight / 2 + 5;

    let hasGround = false;
    if (checkX < 0 || checkX > this.config.levelWidth) {
      hasGround = false;
    } else {
      const platforms =
        this.platforms.getChildren() as Phaser.Physics.Arcade.Sprite[];
      for (const p of platforms) {
        if (p.getBounds().contains(checkX, checkY)) {
          hasGround = true;
          break;
        }
      }
    }
    if (!hasGround) {
      dog.setVelocityX(-velocityX);
      dog.setFlipX(!dog.flipX);
    }
  }

  protected handleCollectTreat(_: any, obj2: any) {
    obj2.disableBody(true, true);
    this.player.getTreat();
  }

  protected handleHitEnemy(obj1: any, obj2: any) {
    const player = obj1 as Player;
    const enemy = obj2 as Phaser.Physics.Arcade.Sprite;
    if (player.isPoweredUp()) {
      enemy.destroy();
      return;
    }
    if (player.body!.touching.down && enemy.body!.touching.up) {
      enemy.destroy();
      player.incrementPower();
      player.setVelocityY(-300);
    } else {
      player.takeDamage();
    }
  }

  protected handleHitBoss(obj1: any, obj2: any) {
    if (this.bossHealth <= 0) return;
    const player = obj1 as Player;
    const boss = obj2 as Phaser.Physics.Arcade.Sprite;

    if (player.isPoweredUp()) {
      this.damageBoss(3);
      this.damageBoss(1); // Ensure extra damage or just loop?
      this.knockback(player, boss);
    } else if (player.body!.touching.down && boss.body!.touching.up) {
      this.damageBoss(1);
      player.setVelocityY(-400);
    } else {
      player.takeDamage();
      this.knockback(player, boss);
    }
  }

  protected damageBoss(amount: number) {
    if (this.boss.getData('invincible')) return;
    this.bossHealth -= amount;
    this.events.emit('boss-health', this.bossHealth);
    this.boss.setTint(0xff0000);
    this.boss.setData('invincible', true);
    this.time.delayedCall(500, () => {
      if (this.boss && this.boss.active) {
        this.boss.clearTint();
        this.boss.setData('invincible', false);
      }
    });

    if (this.bossHealth <= 0) {
      const { x, y } = this.boss;
      this.boss.destroy();
      this.keyObj.enableBody(true, x, y, true, true);
      this.keyObj.setVelocityY(-350);
      this.keyObj.setCollideWorldBounds(true);
    }
  }

  protected knockback(player: Player, enemy: any) {
    player.setVelocityX(player.x < enemy.x ? -300 : 300);
    player.setVelocityY(-200);
  }

  protected handleCollectKey(_: any, obj2: any) {
    obj2.disableBody(true, true);
    this.hasKey = true;
  }

  protected handleTouchCage(_: any, obj2: any) {
    if (this.hasKey) {
      obj2.destroy();
      this.physics.add.overlap(this.player, this.unicorn, () => {
        this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `${this.config.levelName} COMPLETE!`,
            {
              fontSize: '32px',
              color: '#fff',
              backgroundColor: '#000',
              padding: { x: 20, y: 10 },
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0);
        this.physics.pause();

        // Save progress
        const currentUnlocked = parseInt(
          localStorage.getItem('gucci_unlocked_level') || '1',
          10
        );
        if (this.config.levelNumber + 1 > currentUnlocked) {
          localStorage.setItem(
            'gucci_unlocked_level',
            (this.config.levelNumber + 1).toString()
          );
        }

        if (this.config.nextLevelKey) {
          this.time.delayedCall(3000, () =>
            this.scene.start(this.config.nextLevelKey!)
          );
        } else {
          this.add
            .text(
              this.cameras.main.centerX,
              this.cameras.main.centerY + 50,
              `YOU WON THE GAME!`,
              {
                fontSize: '32px',
                color: '#FFFF00',
                stroke: '#000',
                strokeThickness: 4,
              }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

          this.add
            .text(
              this.cameras.main.centerX,
              this.cameras.main.centerY + 110,
              `Click anywhere to Exit`,
              {
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000',
                strokeThickness: 2,
              }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

          // Small delay to prevent accidental clicks from gameplay
          this.time.delayedCall(500, () => {
            this.input.once('pointerdown', () => {
              this.scene.stop('UIScene');
              this.scene.start('StartMenu');
            });
          });
        }
      });
    }
  }

  public setPlayerMoveLeft(isDown: boolean) {
    if (this.player) this.player.setVirtualLeft(isDown);
  }
  public setPlayerMoveRight(isDown: boolean) {
    if (this.player) this.player.setVirtualRight(isDown);
  }
  public playerJump() {
    if (this.player) this.player.virtualJump();
  }
  public playerPower() {
    if (this.player) this.player.virtualPower();
  }
}
