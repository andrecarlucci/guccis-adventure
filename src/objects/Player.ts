import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private jumps = 0;
  private maxJumps = 2; // Double jump
  private isSuperPowered = false;
  private health = 5;
  private treatCount = 0;
  private powerCharge = 0; // New Power Bar counter (0-5)
  private sceneRef: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private superPowerKey: Phaser.Input.Keyboard.Key;
  private _invincible = false;

  // Virtual Input State
  private isVirtualLeft = false;
  private isVirtualRight = false;

  public events = new Phaser.Events.EventEmitter();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cat_idle'); // Use 'cat_idle' as starting texture
    this.sceneRef = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    // Input
    // Non-null assertion for cursors assuming standard keyboard
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.jumpKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.superPowerKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    );

    // Global key listener for 'z'
    scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (
        this.scene &&
        this.active &&
        this.powerCharge >= 5 &&
        !this.isSuperPowered &&
        this.superPowerKey.isDown
      ) {
        this.activateSuperPower();
      }
    });
  }

  update() {
    if (this.health <= 0) return;

    // Movement
    if (this.cursors.left.isDown || this.isVirtualLeft) {
      this.setVelocityX(-200);
      this.setFlipX(true);
      if (this.body!.touching.down) {
        this.anims.play('cat-walk', true); // Play walk if on ground
      }
    } else if (this.cursors.right.isDown || this.isVirtualRight) {
      this.setVelocityX(200);
      this.setFlipX(false);
      if (this.body!.touching.down) {
        this.anims.play('cat-walk', true);
      }
    } else {
      this.setVelocityX(0);
      if (this.body!.touching.down) {
        this.anims.play('cat-idle', true);
      }
    }

    // Jump Animation overrides walk/idle
    if (!this.body!.touching.down) {
      this.anims.play('cat-jump', true);
    }

    // Jump
    // We use JustDown for jump to handle multiple taps
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      // Space
      this.tryJump();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      // Arrow Up (optional support)
      this.tryJump();
    }

    // Reset jumps on ground
    if (this.body!.touching.down) {
      this.jumps = 0;
    }

    if (this.isSuperPowered) {
      this.angle += 20; // Rotate like a tornado
    } else {
      this.angle = 0;
    }
  }

  private tryJump() {
    if (this.jumps < this.maxJumps) {
      this.setVelocityY(-400);
      this.jumps++;
    }
  }

  public getTreat() {
    if (this.health < 5) {
      this.health++;
      this.events.emit('health-changed', this.health);
    }

    this.treatCount++;
    this.events.emit('treats-changed', this.treatCount);
  }

  public incrementPower() {
    if (this.powerCharge < 5) {
      this.powerCharge++;
      this.events.emit('power-changed', this.powerCharge);
    }
  }

  public takeDamage() {
    if (this._invincible || this.isSuperPowered) return;

    this.health--;
    this.events.emit('health-changed', this.health);

    if (this.health <= 0) {
      this.setTint(0xff0000);
      this.setVelocity(0, -300); // Death hop
      // Disable collision to fall through/static
      this.body!.enable = false;
      this.events.emit('died');
    } else {
      this.flashInvincible();
    }
  }

  private flashInvincible() {
    this._invincible = true;
    this.sceneRef.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this._invincible = false;
        this.alpha = 1;
      },
    });
  }

  private activateSuperPower() {
    this.isSuperPowered = true;
    this.events.emit('power-active', true);
    this.powerCharge = 0;
    this.events.emit('power-changed', this.powerCharge);

    // Effect modification
    this.setTint(0x00ffff);

    // Duration 5 seconds
    this.sceneRef.time.delayedCall(5000, () => {
      this.isSuperPowered = false;
      this.events.emit('power-active', false);
      this.clearTint();
    });
  }

  public isPoweredUp(): boolean {
    return this.isSuperPowered;
  }

  public getHealth(): number {
    return this.health;
  }

  // Virtual Input Methods
  public setVirtualLeft(isDown: boolean) {
    this.isVirtualLeft = isDown;
  }

  public setVirtualRight(isDown: boolean) {
    this.isVirtualRight = isDown;
  }

  public virtualJump() {
    this.tryJump();
  }

  public virtualPower() {
    if (this.powerCharge >= 5 && !this.isSuperPowered) {
      this.activateSuperPower();
    }
  }
}
