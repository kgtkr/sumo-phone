phina.globalize();

var W = 640;
var H = 480;
var ASSETS = {
  image: {
    death: "image/death.png",
    normal: "image/normal.png",
    phone: "image/phone.png",
    police: "image/police.png",
  },
  sound: {
    good: "se/good.mp3",
    bad: "se/bad.mp3",
    go: "se/go.mp3",
    count: "se/count.mp3",
  },
};

//ゲームシーン
phina.define("MainScene", {
  superClass: "CanvasScene",
  init: function () {
    this.superInit();

    const game = this;

    const num = 5;
    this.targets = CanvasElement().addChildTo(this);
    for (let i = 0; i < num; i++) {
      let target = Sprite("normal").addChildTo(this.targets);
      target.y = H / 2;
      target.x = W / (num + 1) * (i + 1);
      target.state = {
        type: "normal",
        count: Math.randint(60, 300)
      };
      target.update = function (app) {
        //倍率
        if (this.state.count === 0) {
          if (this.state.type === "normal") {
            if (Math.randint(0, 5) === 0) {
              //警察
              this.state = {
                type: "police",
                count: Math.randint(30, 90)
              };
              this.image = "police";
            } else {
              //スマホ
              this.state = {
                type: "phone",
                count: Math.round(game.time / (20 * 60) * 60) + 12,
                point: Math.ceil((20 * 60 - game.time) / 60)
              };
              this.image = "phone";
            }
          } else {
            this.image = "normal";
            this.state = {
              type: "normal",
              count: Math.randint(60, 300)
            };
          }
        }

        if (app.keyboard.getKey((i + 1).toString())) {
          this.onpointstart();
        }

        this.state.count--;
      };

      target.setInteractive(true);

      target.onpointstart = function (app) {
        switch (this.state.type) {
          case "normal":
            game.score--;
            SoundManager.play('bad');
            break;
          case "phone":
            game.score += this.state.point;
            SoundManager.play('good');
            break;
          case "police":
            SoundManager.play('go');
            game.exit("result", { score: game.score });
            break;
        }

        if (this.state.type !== "death") {
          this.state = {
            type: "death",
            count: 60
          };
          this.image = "death";
        }
      };
    }

    this.score = 0;

    this.scoreL = Label().addChildTo(this);
    this.scoreL.top = 10;
    this.scoreL.fill = "green";
    this.scoreL.update = function (app) {
      this.text = "Score:" + game.score;
      this.left = 100;
    };

    this.time = 20 * 60;

    this.timeL = Label().addChildTo(this);
    this.timeL.top = 50;
    this.timeL.fill = "green";
    this.timeL.update = function (app) {
      this.text = "Time:" + Math.ceil(game.time / 60);
      this.left = 100;
    };
  },

  update: function (app) {
    this.time--;
    if (this.time % 60 === 0 && this.time <= 5 * 60) {
      SoundManager.play('count');
    }
    if (this.time === 0) {
      this.exit("result", { score: this.score });
    }
  }
});

// メイン処理
phina.main(function () {
  var app = GameApp({
    width: W,
    height: H,
    fps: 60,
    title: "Sumo Phone",
    assets: ASSETS,
  });
  app.run();
});
