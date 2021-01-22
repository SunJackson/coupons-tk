// pages/detail/detail.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_id: [],
    search_id: "",
    detail: null,
    tk_type: "",
    goods_url: "",
    name: "",
    reserve_price: "",
    zk_final_price: "",
    production : {},
    is_stype: "false",
    goods_thumbnail_url: "",
    shareProduction: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.goods_url){
      this.setData({
        goods_url: "https:" + decodeURIComponent(options.goods_url),
      });
    }
    if (options.production){
      this.setData({
        production: JSON.parse(options.production),
      });
    }
    this.data.shareProduction = options.production
    console.log(JSON.parse(options.production))
    console.log(options)
    this.setData({
      goods_id: options["gid"],
      search_id: options["search_id"],
      tk_type: options["tk_type"],
      is_stype: options['is_stype'],
    });
    this.reloadData();
  },
  formatDate(datetime) {
    if (datetime) {
      var date = new Date(datetime);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    }else{
      var date = new Date();//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    }
    var year = date.getFullYear(),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        sdate = ("0" + date.getDate()).slice(-2);
    var result = year + "-"+ month +"-"+ sdate;
    return result;
  },
  reloadData() {
    wx.showLoading({
      title: '加载中...',
    });
    if (this.data.is_stype === "true" && this.data.tk_type === "tb"){
      var list = this.data.production;
      if (list && list !== {}) {
        list.coupon_start_time_format = this.formatDate(parseInt(list.coupon_start_time));
        list.coupon_end_time_format = this.formatDate(parseInt(list.coupon_end_time));
        this.setData({
          detail: list,
          name: list.goods_name,
          reserve_price: list.min_group_price / 100,
          zk_final_price: list.zk_final_price / 100,
        });
      }

    }else{
      wx.cloud.callFunction({
        name: "pquery",
        data: {
          tk_type: this.data.tk_type,
          detail: true,
          goods_id_list: this.data.goods_id,
          search_id: this.data.search_id,
        }
      })
      .then(res => {
        if (this.data.tk_type === "pdd"){
          if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_detail_response && res.result.data.goods_detail_response.goods_details) {
            const list = res.result.data.goods_detail_response.goods_details;
            if (list && list.length > 0) {
              list[0].coupon_start_time_format = this.formatDate(list[0].coupon_start_time * 1000);
              list[0].coupon_end_time_format = this.formatDate(list[0].coupon_end_time * 1000);
              this.setData({
                detail: list[0],
                name: list[0].goods_name,
                reserve_price: list[0].min_group_price / 100,
                zk_final_price: (list[0].min_group_price - list[0].coupon_discount) / 100,
              });
            }
          }
        }
        else if(this.data.tk_type === "tb"){
          if (res.result && res.result._status === 0 && res.result.data && res.result.data.results && res.result.data.results.n_tbk_item) {
            const list = res.result.data.results.n_tbk_item;
            if (list && list.length > 0) {
              let detail = {
                coupon_start_time_format:  this.formatDate(0),
                coupon_end_time_format: "长期",
                goods_gallery_urls: list[0].small_images.string,
                min_group_price: list[0].reserve_price * 100,
                coupon_discount: (list[0].reserve_price - list[0].zk_final_price) * 100,
                sales_tip: list[0].volume,
                mall_name: list[0].nick,
                goods_name: list[0].title,
                desc_txt: "高",
                serv_txt: "高",
                lgst_txt: "高",
                goods_desc: list[0].title,
              };
              this.setData({
                detail: detail,
                name: list[0].title,
                reserve_price: list[0].reserve_price * 100,
                zk_final_price: list[0].zk_final_price * 100,
              });
            }
          }
        }
      }).catch(err => {
        wx.stopPullDownRefresh();
        wx.hideLoading();
      });
    }
    wx.stopPullDownRefresh();
    wx.hideLoading();
   
  },
  onPullDownRefresh: function() {
    this.reloadData();
  },
  onShareAppMessage: function(e) {
    var path = '/pages/index/index';
    var imageUrl = this.data.detail.goods_thumbnail_url;
    if (this.data.tk_type === "pdd"){
      var path = '/pages/detail/detail?gid=' + this.data.goods_id + '&search_id=' + this.data.search_id  + '&tk_type=' + this.data.tk_type  + '&is_stype=' + this.data.is_stype  + '&production=' + this.data.shareProduction;
    }else if(this.data.tk_type === "tb"){
      var goods_url = encodeURIComponent(this.data.goods_url);
      var path = '/pages/detail/detail?gid=' + this.data.goods_id + '&search_id=' + this.data.search_id  + '&tk_type=' + this.data.tk_type + '&goods_url=' + goods_url  + '&is_stype=' + this.data.is_stype  + '&production=' + this.data.shareProduction;
      if (this.data.is_stype === "true"){
        var imageUrl = "https:" + this.data.detail.goods_thumbnail_url;
        var path = '/pages/tbindex/tbindex';
      }
      
    }
    if (parseInt((this.data.reserve_price - this.data.zk_final_price))) {
      var title = "告诉你一个秘密，这里有张" + (this.data.reserve_price - this.data.zk_final_price).toFixed(2) + "元优惠券送给你!点击领取...";
    }else{
      var title = "悄悄告诉你一个秘密，这里有张优惠券送给你!点击领取...";
    }
    return {
      title: title,
      path: path,
　　　imageUrl: imageUrl,
    };
  },
  onShareTimeline() {
		var path = '/pages/index/index';
    var imageUrl = this.data.detail.goods_thumbnail_url;
    if (this.data.tk_type === "pdd"){
      var path = '/pages/detail/detail?gid=' + this.data.goods_id + '&search_id=' + this.data.search_id  + '&tk_type=' + this.data.tk_type  + '&is_stype=' + this.data.is_stype  + '&production=' + this.data.shareProduction;
    }else if(this.data.tk_type === "tb"){
      var goods_url = encodeURIComponent(this.data.goods_url);
      var path = '/pages/detail/detail?gid=' + this.data.goods_id + '&search_id=' + this.data.search_id  + '&tk_type=' + this.data.tk_type + '&goods_url=' + goods_url  + '&is_stype=' + this.data.is_stype  + '&production=' + this.data.shareProduction;
      if (this.data.is_stype === "true"){
        var imageUrl = "https:" + this.data.detail.goods_thumbnail_url;
        var path = '/pages/tbindex/tbindex';
      }
      
    }
    if (parseInt((this.data.reserve_price - this.data.zk_final_price))) {
      var title = "告诉你一个秘密，这里有张" + (this.data.reserve_price - this.data.zk_final_price).toFixed(2) + "元优惠券送给你!点击领取...";
    }else{
      var title = "悄悄告诉你一个秘密，这里有张优惠券送给你!点击领取...";
    }
    return {
      title: title,
      path: path,
　　　imageUrl: imageUrl,
    };
	},
  buy() {
    wx.showLoading({
      title: '处理中...',
    });
    
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        generate: true,
        goods_id_list: this.data.goods_id,
        search_id: this.data.search_id,
        url: this.data.goods_url,
        text: this.data.name,
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading();
      if (this.data.tk_type === "pdd"){
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_promotion_url_generate_response && res.result.data.goods_promotion_url_generate_response.goods_promotion_url_list) {
          const list = res.result.data.goods_promotion_url_generate_response.goods_promotion_url_list;
          if (list.length > 0) {
            const r = list[0];
            if (r.we_app_info) {
              wx.navigateToMiniProgram({
                appId: r.we_app_info.app_id,
                path: r.we_app_info.page_path,
              });
            }
          }
        }
      }else if(this.data.tk_type === "tb"){
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.data && res.result.data.data.model) {
          const model = res.result.data.data.model;
          const password_simple = res.result.data.data.password_simple;
          wx.setClipboardData({
            data: model,
            success (res) {
              wx.getClipboardData({
                success (res) {
                  wx.showToast({
                    title: '成功复制口令',
                    icon: 'success',
                    duration: 2000
                  })
                },
                fail (err){
                  wx.showToast({
                    title: '复制口令失败',
                    icon: 'error',
                    duration: 2000
                  })
                }
              })
            }
          })
          
        }
      }
      
    }).catch(err => {
      wx.hideLoading();
    });
  },
  gohome() {
    wx.navigateBack({
      delta: 1
    })    
  }
})