// pages/stype/stype.js

//获取应用实例
const app = getApp()

Page({
  data: {
    tk_type: "",
    banner: null,
    type: 1,
    productions: [],
    list_id: "",
    request_id: "",
    search_id: "",
    total_count: 0,
    // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;12-按照加入多多进宝时间降序;;8-优惠券金额排序降序
    offset: 0,
    limit: 10,
  },
  onPullDownRefresh: function() {
    this.reloadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  onReachBottom: function() {
    this.loadNext();
  },
  reloadData() {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.offset = 0;
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        stype: true,
        limit: this.data.limit,
        offset: this.data.offset,
        channel_type: this.data.type,
      }
    })
   .then(res => {
     console.log("stype", res)
      if (this.data.tk_type === "pdd") {
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_basic_detail_response && res.result.data.goods_basic_detail_response.list) {
          const list = res.result.data.goods_basic_detail_response.list;
          this.setData({
            productions: list,
            list_id:  res.result.data.goods_basic_detail_response.list_id,
            request_id:  res.result.data.goods_basic_detail_response.request_id,
            search_id:  res.result.data.goods_basic_detail_response.search_id,
            total_count:  res.result.data.goods_basic_detail_response.total_count,
          });
        }
      }else if(this.data.tk_type === "tb") {
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.result_list && res.result.data.result_list.map_data) {
          const list = res.result.data.result_list.map_data.map(item => {
            console.log('stype tb', item)
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
      }
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
    });
  },
  loadNext() {
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        stype: true,
        limit: this.data.limit,
        offset: this.data.offset + this.data.limit,
        channel_type: this.data.type,
      }
    }).then(res => {
      wx.hideLoading();
      if (this.data.tk_type === "pdd") {
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_basic_detail_response && res.result.data.goods_basic_detail_response.list) {
          const list = res.result.data.goods_basic_detail_response.list;
          this.setData({
            productions: this.data.productions.concat(list),
            list_id:  res.result.data.goods_basic_detail_response.list_id,
            request_id:  res.result.data.goods_basic_detail_response.request_id,
            search_id:  res.result.data.goods_basic_detail_response.search_id,
            total_count:  res.result.data.goods_basic_detail_response.total_count,
            offset: this.data.offset + this.data.limit,
          });
        }
      }else if (this.data.tk_type === "tb") {
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.result_list && res.result.data.result_list.map_data) {
          const list = res.result.data.result_list.map_data.map(item => {
            return {
              goods_image_url: item.pict_url,
              goods_name: item.title,
              zk_final_price: item.zk_final_price * 100,
              min_group_price: item.reserve_price * 100,
              sales_tip: item.volume,
              goods_url: item.url,
              goods_thumbnail_url: item.pict_url,
              coupon_discount: (item.reserve_price - item.zk_final_price) * 100,
              goods_id:  item.num_iid,
            }
          }
          );
          this.setData({
            productions: this.data.productions.concat(list),
            request_id:  res.requestID,
            search_id:  res.result.data.request_id,
            total_count:  res.result.data.total_results,
            offset: this.data.offset + this.data.limit,
          });
        }
      }

      
    }).catch(err => {
      wx.hideLoading();
    });
  },
  onLoad: function (option) {
    this.data.type = option.type;
    wx.setNavigationBarTitle({
      title: option.title,
    });
    if (option.banner) {
      this.setData({
        banner: option.banner.trim()
      });
    }
    if (option.tk_type) {
      this.setData({
        tk_type: option.tk_type
      });
    }
    this.reloadData();
  },
})
