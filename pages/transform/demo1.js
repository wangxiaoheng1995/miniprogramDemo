import matrix from './matrix.js'
//获取应用实例
const app = getApp()

Page({
  data: {
    hasDot: false,
    hasRect: false,
    hasPic: true,
    imgRatio: 1,
    count: 4,
    canvas: null,
    ctx: null,
    dots: [],
    dotscopy: null,
    idots: null,
    width: 0,
    height: 0,
    area: null,
    dot: null

  },
  onLoad: function (res) {
    const query = wx.createSelectorQuery()
    query.select('#cas')
      .fields({ node: true, size: true })
      .exec(this.init.bind(this))
  },
  init: function(res) {
    res[0].node.width = res[0].width;
    res[0].node.height = res[0].height;
    this.setData({
      width: res[0].width,
      height: res[0].height,
      canvas: res[0].node,
      ctx: res[0].node.getContext('2d'),
      img: res[0].node.createImage()
    });
    let maxHeight = 200;
    let img = this.data.img;
    img.src = './img/test2.jpg';
    img.onload = () => {
      let img_w = img.width,
        img_h = img.height;
      if (img_h > maxHeight) {
        this.setData({
          imgRatio: maxHeight / img_h
        });
        img_h = maxHeight;
        img_w *= this.data.imgRatio;
      }
      let left = (this.data.width - img_w) / 2;
      let top = (this.data.height - img_h) / 2;
      img.width = img_w;
      img.height = img_h;
      this.setData({
        dots: [
          { x: left, y: top },
          { x: left + img_w, y: top },
          { x: left + img_w, y: top + img_h },
          { x: left, y: top + img_h },
        ]
      });
      //保存一份不变的拷贝
      this.setData({
        dotscopy: [
          { x: left, y: top },
          { x: left + img_w, y: top },
          { x: left + img_w, y: top + img_h },
          { x: left, y: top + img_h },
        ]
      });
      //获得所有初始点坐标
      this.setData({
        idots: this.rectsplit(this.data.count, this.data.dotscopy[0], this.data.dotscopy[1], this.data.dotscopy[2], this.data.dotscopy[3])
      })
      this.render();
    };
  },
  /**
   * 将 abcd 四边形分割成 n 的 n 次方份，获取 n 等分后的所有点坐标
   * @param n     多少等分
   * @param a     a 点坐标
   * @param b     b 点坐标
   * @param c     c 点坐标
   * @param d     d 点坐标
   * @returns {Array}
   */
  rectsplit: function (n, a, b, c, d) {
    // ad 向量方向 n 等分
    var ad_x = (d.x - a.x) / n;
    var ad_y = (d.y - a.y) / n;
    // bc 向量方向 n 等分
    var bc_x = (c.x - b.x) / n;
    var bc_y = (c.y - b.y) / n;

    var ndots = [];
    var x1, y1, x2, y2, ab_x, ab_y;

    //左边点递增，右边点递增，获取每一次递增后的新的向量，继续 n 等分，从而获取所有点坐标
    for(var i = 0; i <= n; i++) {
      //获得 ad 向量 n 等分后的坐标
      x1 = a.x + ad_x * i;
      y1 = a.y + ad_y * i;
      //获得 bc 向量 n 等分后的坐标
      x2 = b.x + bc_x * i;
      y2 = b.y + bc_y * i;

      for (var j = 0; j <= n; j++) {
        // ab 向量为：[x2 - x1 , y2 - y1]，所以 n 等分后的增量为除于 n
        ab_x = (x2 - x1) / n;
        ab_y = (y2 - y1) / n;

        ndots.push({
          x: x1 + ab_x * j,
          y: y1 + ab_y * j,
        });
      }
    }
    return ndots;
  },
  /**
   * 计算矩阵，同时渲染图片
   * @param arg_1
   * @param _arg_1
   * @param arg_2
   * @param _arg_2
   * @param arg_3
   * @param _arg_3
   */
  renderImage: function (arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, vertex) {
    const ctx = this.data.ctx;
    const hasRect = this.data.hasRect;
    const hasPic = this.data.hasPic;
    const img = this.data.img;
    const count = this.data.count;
    const idots = this.data.idots;
    const imgRatio = this.data.imgRatio;
    ctx.save();
    //根据变换后的坐标创建剪切区域
    ctx.beginPath();
    ctx.moveTo(_arg_1.x, _arg_1.y);
    ctx.lineTo(_arg_2.x, _arg_2.y);
    ctx.lineTo(_arg_3.x, _arg_3.y);
    ctx.closePath();
    if(hasRect) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
    ctx.clip();

    if(hasPic) {
      //传入变换前后的点坐标，计算变换矩阵
      var result = matrix.getMatrix.apply(this, arguments);

      //变形
      ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);

      var w = img.width / count;
      var h = img.height / count;
      //绘制图片
      ctx.drawImage(
        img,
        (vertex.x - idots[0].x) / imgRatio - 1,
        (vertex.y - idots[0].y) / imgRatio - 1,
        w / imgRatio + 2,
        h / imgRatio + 2,
        vertex.x - 1,
        vertex.y - 1,
        w + 2,
        h + 2
      );
    }
    ctx.restore();
  },
  /**
   * 画布渲染
   */
  render: function () {
    const ctx = this.data.ctx;
    const count = this.data.count;
    const width = this.data.width;
    const height = this.data.height;
    const dots = this.data.dots;
    const idots = this.data.idots;
    ctx.clearRect(0, 0, width, height);

    var ndots = this.rectsplit(count, dots[0], dots[1], dots[2], dots[3]);

    ndots.forEach((d, i) => {
      //获取平行四边形的四个点
      var dot1 = ndots[i];
      var dot2 = ndots[i + 1];
      var dot3 = ndots[i + count + 2];
      var dot4 = ndots[i + count + 1];

      //获取初始平行四边形的四个点
      var idot1 = idots[i];
      var idot2 = idots[i + 1];
      var idot3 = idots[i + count + 2];
      var idot4 = idots[i + count + 1];

      if (dot2 && dot3 && i % (count + 1) < count) {
        //绘制三角形的下半部分
        this.renderImage(idot3, dot3, idot2, dot2, idot4, dot4, idot1);

        //绘制三角形的上半部分
        this.renderImage(idot1, dot1, idot2, dot2, idot4, dot4, idot1);
      }

      if (this.data.hasDot) {
        ctx.fillStyle = 'red';
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
      }
    });
  },
  /**
  * 获取鼠标点击/移过的位置
  * @param e
  * @returns {{t: number, l: number}}
  */
  getArea: function (e) {
    const canvas = this.data.canvas;
    console.log({
      t: e.changedTouches[0].y - canvas._canvasRef.offsetTop,
      l: e.changedTouches[0].x - canvas._canvasRef.offsetLeft
    })
    return {
      t: e.changedTouches[0].y - canvas._canvasRef.offsetTop,
      l: e.changedTouches[0].x - canvas._canvasRef.offsetLeft
    };
  },
  /**
   * 鼠标拖动事件绑定
   * @param e
   */
  casTouchstart: function(e) {
    const dots = this.data.dots;
    if (!dots.length) return;
    let area = this.getArea(e);
    this.setData({area: area});
    let dot, i;
    //鼠标事件触发区域
    let qy = 40;
    for (i = 0; i < dots.length; i++) {
      this.setData({dot: dots[i]});
      dot = dots[i];
      if (area.t >= dot.y - qy && area.t <= dot.y + qy && area.l >= dot.x - qy && area.l <= dot.x + qy) {
        break;
      } else {
        this.setData({dot: null});
      }
    }

  },
  casTouchmove: function (e) {
    let area = this.data.area;
    let narea = this.getArea(e);
    let dot = this.data.dot;
    let nx = narea.l - area.l;
    let ny = narea.t - area.t;
    if (!dot) return;
    dot.x += nx;
    dot.y += ny;
    this.setData({ 
      dot: dot,
      area: narea
    })
    this.render();
  },

  casTouchend: function () {
    this.setData({
      area: null,
      dot: null})
  }
})
