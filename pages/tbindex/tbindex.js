//index.js

//获取应用实例
const app = getApp()
import env from "../../env";

Page({
  onShareAppMessage: function() {
    return {
      title: "悄悄告诉你一个秘密，这里有海量淘宝优惠券！",
      path: "/pages/tbindex/tbindex",
      imageUrl: "../../images/lucky.jpeg",
    }
  },
  onShareTimeline() {
		var path = '/pages/tbindex/tbindex';
    return {
      title: "告诉你一个秘密，这里有大量淘宝优惠券送给你!点击领取...",
      path: path,
　　　imageUrl: "../../images/lucky.jpeg",
    };
	},
  data: {
    searchVal: "",
    env: env,
    tk_type: 'tb',
    s_category_oid: "3756",
    categorys: [
      {
        text: "综合",
        oid: "3756",
      },
      {
        text: "女装",
        oid: 3767,
      },
      {
        text: "男装",
        oid: 3764,
      },
      {
        text: "家居家装",
        oid: 3758,
      },
      {
        text: "数码家电",
        oid: 3759,
      },
      {
        text: "鞋包配饰",
        oid: 3762,
      },
      {
        text: "运动户外	",
        oid: 3766,
      },
      {
        text: "美妆个护",
        oid: 3763,
      },
      {
        text: "内衣",
        oid: 3765,
      },
      {
        text: "母婴",
        oid: 3760,
      },
      {
        text: "食品",
        oid: 3761,
      },
      
    ],
    productions: [],
    list_id: "",
    request_id: "",
    search_id: "",
    total_count: 0,
    // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;
    sort_type: 8,
    sort: "",
    page: 1,
    cat: "",
    menulist:[
      {
        "id":"1",
        "url":"../../images/top.png",
        "title":"顶部",
      },
      {
        "id": "2",
        "url": "../../images/pdd-menu.png",
        "title": "多多券",
      },
    ],
    mainmodel:{
      "url": "../../images/home-menu.png",
    }
  },
  menuItemClick:function(res){
    console.log(res);
    //获取点击事件的信息
    let clickInfo = res.detail.iteminfo 
    console.log(clickInfo);
    // 根据不同类型进行判别处理
    //事件的处理 代码
    switch (clickInfo.id) {
      case 'top':
        this.goTop();
      case 'tbindex':
        break;
      case 'wm':
        wx.navigateToMiniProgram({
          appId: clickInfo.appid,
          path: clickInfo.path
        });
        break;
      default:
        wx.navigateTo({
          url: '/pages/' + clickInfo.id + '/' + clickInfo.id,
        });
    }
   
  },
  onGetHome: function() {
    // 调用云函数
    let that = this;
    wx.cloud.callFunction({
      name: 'home',
      data: {
      }
    })
    .then(res => {
      console.log('[云函数] [home]: ', res)
      this.data.menulist = res.result.menulist;
      this.setData({
        menulist: res.result.menulist
      });
      
    }).catch(err => {
      console.log(err)
    })
  },
    /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    console.log('onShow');
    this.onGetHome();
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
  gotoStype: function(event) {
    wx.navigateTo({
      url: '/pages/stype/stype?type=' + event.currentTarget.dataset.type + "&title=" + event.currentTarget.dataset.title + "&banner=" + event.currentTarget.dataset.banner + "&tk_type=" + event.currentTarget.dataset.tktype,
    });
  },
  onPullDownRefresh: function() {
    this.reloadData();
  },
  onReachBottom: function() {
    this.loadNext();
  },
  bindKeyInput: function (e) {
    this.setData({
      searchVal: e.detail.value
    })
  },
  
  searchContent: function(e) {
    console.log("跳转");
    wx.navigateTo({
      url: '/pages/search/search?searchVal=' + this.data.searchVal + "&tk_type=" + this.data.tk_type,
      success: function (res) {
        console.log("跳转search成功");
      },
      fail: function (res) {
        console.log("跳转search失败");
      }
    })

  },
  reloadData() {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.page = 1;
    this.data.searchVal = getApp().globalData.searchKey;
   
    
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type : this.data.tk_type,
        optimus: true,
        material_id: this.data.s_category_oid,
        sort_type: this.data.sort
      }
    })
    .then(res => {
      if (res.result && res.result._status === 0 && res.result.data && res.result.data.result_list && res.result.data.result_list.map_data) {
        const list = res.result.data.result_list.map_data.map(item => {
          return {
            goods_image_url: item.pict_url,
            goods_name:item.user_type===1 ? "【天猫】" + item.title: item.title,
            zk_final_price: item.zk_final_price * 100,
            min_group_price: item.reserve_price * 100,
            sales_tip: item.volume,
            goods_thumbnail_url: item.pict_url,
            coupon_discount: (item.reserve_price - item.zk_final_price) * 100,
            goods_id:  item.num_iid,
            coupon_start_time:  item.coupon_start_time,
            coupon_end_time: item.coupon_end_time,
            goods_gallery_urls: item.small_images.string,
            mall_name: item.nick,
            desc_txt: "--",
            serv_txt: "--",
            lgst_txt: "--",
            goods_desc: item.item_description,
            goods_url: encodeURIComponent(item.click_url)
          }
        }
        );
        
        this.setData({
          productions: list,
          request_id:  res.requestID,
          search_id:  res.result.data.request_id,
          total_count:  res.result.data.total_results,
        });
      }
      wx.stopPullDownRefresh();
      wx.hideLoading();
    }).catch(err => {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  },
  loadNext() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        sort_type: this.data.sort,
        optimus: true,
        material_id: this.data.s_category_oid,
        page: this.data.page + 1
      }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result._status === 0 && res.result.data && res.result.data.result_list && res.result.data.result_list.map_data) {
        const list = res.result.data.result_list.map_data.map(item => {
          return {            
            goods_image_url: item.pict_url,
            goods_name:item.user_type===1 ? "【天猫】" + item.title: item.title,
            zk_final_price: item.zk_final_price * 100,
            min_group_price: item.reserve_price * 100,
            sales_tip: item.volume,
            goods_thumbnail_url: item.pict_url,
            coupon_discount: (item.reserve_price - item.zk_final_price) * 100,
            goods_id:  item.num_iid,
            coupon_start_time:  item.coupon_start_time,
            coupon_end_time: item.coupon_end_time,
            goods_gallery_urls: item.small_images.string,
            mall_name: item.nick,
            desc_txt: "--",
            serv_txt: "--",
            lgst_txt: "--",
            goods_desc: item.item_description,
            goods_url:  encodeURIComponent(item.click_url)
          }
        }
        );
        this.setData({
          productions: this.data.productions.concat(list),
          request_id:  res.requestID,
          search_id:  res.result.data.request_id,
          total_count:  res.result.data.total_results,
          page: this.data.page + 1,
        });
      }
    }).catch(err => {
      wx.hideLoading();
    });
  },
  changeCategoryId: function(event) {
    if (event && event.target && event.target.dataset) {
      if (event.target.dataset.oid) {
        if (this.data.s_category_oid !== event.target.dataset.oid) {
          this.setData({
            s_category_oid: event.target.dataset.oid
          });
          this.reloadData();
        }
      }
    }
  },
  changeSortType: function(event) {
    let isChange = false;
    if (event && event.target && event.target.dataset) {
      if (event.target.dataset.type) {
        switch(event.target.dataset.type) {
          case "zh":
            if (this.data.sort_type !== 0) {
              this.setData({
                sort_type: 0
              });
              isChange = true;
            }
            break;
          case "rm":
            if (this.data.sort_type !== 1 && this.data.sort_type !== 2) {
              this.setData({
                sort_type: 2
              });
              isChange = true;
            } else {
              this.setData({
                sort_type: this.data.sort_type === 2 ? 1 : 2
              });
              isChange = true;
            }
            break;
          case "xl":
            if (this.data.sort_type !== 6 && this.data.sort_type !== 7) {
              this.setData({
                sort_type: 7
              });
              isChange = true;
            } else {
              this.setData({
                sort_type: this.data.sort_type === 7 ? 6 : 7
              });
              isChange = true;
            }
            break;
          case "jg":
            if (this.data.sort_type !== 3 && this.data.sort_type !== 4) {
              this.setData({
                sort_type: 3
              });
              isChange = true;
            } else {
              this.setData({
                sort_type: this.data.sort_type === 3 ? 4 : 3
              });
              isChange = true;
            }
            break;
          default:
            break;
        }
        if (isChange) {
          var sort_map = {
            8 : "tk_total_sales_des",
            1 : "tk_rate_asc",
            2 : "tk_rate_des",
            3 : "price_asc",
            4 : "price_des",
            6 : "sales_asc",
            7 : "sales_des",
          };
          // 排序方式:0-综合排序;1-佣金升;2-佣金降;3-按价格升序;4-按价格降序;6-按销量降序;
          if (this.data.sort_type) {
            this.data.sort = sort_map[this.data.sort_type]
          };
          this.reloadData();
        }
      }
    }
  },
  onLoad: function () {
    this.setData({
      menulist: app.globalData.menulist
    });
    this.reloadData();
  }
})
