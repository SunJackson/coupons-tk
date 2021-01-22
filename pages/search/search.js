// pages/search/search.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    tk_type: "",
    preSearchVal: "",
    searchVal: "",
    historys: [],
    productions: [],
    list_id: "",
    request_id: "",
    search_id: "",
    total_count: 0,
    // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;12-按照加入多多进宝时间降序;;8-优惠券金额排序降序
    sort_type: "",
    sort: 0,
    page: 1,
    filterYH: false,
  },
  onShareAppMessage: function() {
    return {
      title: "告诉你一个秘密，这里有大量优惠券送给你!点击领取...",
      path: "/pages/index/index",
      imageUrl: "../../images/lucky.jpeg",
    }
  },
  onShareTimeline() {
		var path = "/pages/index/index";
    return {
      title: "告诉你一个秘密，这里有大量优惠券送给你!点击领取...",
      path: path,
　　　imageUrl: "../../images/lucky.jpeg",
    };
	},
  onlyFilterChange: function(e) {
    this.setData({
      filterYH: e.detail.value,
    });
    this.reloadData();
  },
  onTapHistory: function(e) {
    this.setData({
      searchVal: e.currentTarget.dataset.val,
    });
    this.reloadData();
  },
  bindKeyInput: function (e) {
    this.setData({
      searchVal: e.detail.value
    })
  },
  clearSearchContent: function() {
    wx.setStorageSync('historys', JSON.stringify([]));
    this.reloadHistory();
  },
  searchContent: function() {
    if (!this.data.searchVal || this.data.searchVal.trim() === "") {
      this.setData({
        productions: [],
      });
      return;
    }
    let hs = [this.data.searchVal.trim()];
    for (let h of this.data.historys) {
      if (h !== this.data.searchVal) {
        hs.push(h);
      }
      if (hs.length === 0) {
        break;
      }
    }
    wx.setStorageSync('historys', JSON.stringify(hs));
    this.reloadHistory();
    this.reloadData();
  },
  reloadHistory: function() {
    try {
      var historys = wx.getStorageSync('historys')
      if (historys) {
        this.setData({
          historys: JSON.parse(historys)
        });
      }
    } catch (e) {
    }
  },
  onPullDownRefresh: function() {
    this.reloadHistory();
    this.reloadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  onReachBottom: function() {
    this.loadNext();
  },
  reloadData() {
    if (!this.data.searchVal || this.data.searchVal.trim() === "") {
      wx.stopPullDownRefresh();
      return;
    }
    wx.showLoading({
      title: '加载中...',
    })
    this.data.page = 1;
    if (this.data.tk_type === "tb"){
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
      if (this.data.sort) {
        this.data.sort_type = sort_map[this.data.sort];
      }else{
        this.data.sort_type = this.data.sort;
      };
    }

    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        sort_type: this.data.sort_type,
        keyword: this.data.searchVal.trim(),
        with_coupon: this.data.filterYH,
      }
    })
   .then(res => {
     if (this.data.tk_type === "pdd"){
      if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
        wx.stopPullDownRefresh();
        const list = res.result.data.goods_search_response.goods_list;
        if (list.length === 0) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '搜索不到相关的商品',
            showCancel: false,
          });
          this.setData({
            productions: [],
          });
          return;
        }
        this.setData({
          productions: list,
          list_id:  res.result.data.goods_search_response.list_id,
          request_id:  res.result.data.goods_search_response.request_id,
          search_id:  res.result.data.goods_search_response.search_id,
          total_count:  res.result.data.goods_search_response.total_count,
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
            goods_url: encodeURIComponent(item.url),
            goods_thumbnail_url: item.pict_url,
            coupon_discount: (item.reserve_price - item.zk_final_price) * 100,
            goods_id:  item.num_iid,
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
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  },
  loadNext() {
    if (!this.data.searchVal || this.data.searchVal.trim() === "") {
      return;
    }
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name: "pquery",
      data: {
        tk_type: this.data.tk_type,
        sort_type: this.data.sort_type,
        page: this.data.page + 1,
        list_id: this.data.list_id,
        keyword: this.data.searchVal.trim(),
        with_coupon: this.data.filterYH,
      }
    }).then(res => {
      wx.hideLoading();
      if (this.data.tk_type === "pdd"){
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
          const list = res.result.data.goods_search_response.goods_list;
          this.setData({
            productions: this.data.productions.concat(list),
            list_id:  res.result.data.goods_search_response.list_id,
            request_id:  res.result.data.goods_search_response.request_id,
            search_id:  res.result.data.goods_search_response.search_id,
            total_count:  res.result.data.goods_search_response.total_count,
            page: this.data.page + 1
          });
        }

      }else if(this.data.tk_type === "tb"){
        if (res.result && res.result._status === 0 && res.result.data && res.result.data.result_list && res.result.data.result_list.map_data) {
          const list = res.result.data.result_list.map_data.map(item => {
            return {
              goods_image_url: item.pict_url,
              goods_name: item.user_type===1 ? "【天猫】" + item.title: item.title,
              zk_final_price: item.zk_final_price * 100,
              min_group_price: item.reserve_price * 100,
              sales_tip: item.volume,
              goods_url: encodeURIComponent(item.url),
              goods_thumbnail_url: item.pict_url,
              coupon_discount: (item.reserve_price - item.zk_final_price) * 100,
              goods_id:  item.num_iid,
              coupon_info:  item.coupon_info,
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
      }
      
    }).catch(err => {
      wx.hideLoading();
    });
  },
  changeSortType: function(event) {
    let isChange = false;
    if (event && event.target && event.target.dataset) {
        if (this.data.tk_type === "pdd"){
          if (event.target.dataset.type) {
            switch(event.target.dataset.type) {
              case "zh":
                if (this.data.sort !== 0) {
                  this.setData({
                    sort: 0
                  });
                  isChange = true;
                }
                break;
              case "yhq":
                if (this.data.sort !== 8) {
                  this.setData({
                    sort: 8
                  });
                  isChange = true;
                }
                break;
              case "xl":
                if (this.data.sort !== 6) {
                  this.setData({
                    sort: 6
                  });
                  isChange = true;
                }
                break;
              case "jg":
                if (this.data.sort !== 3 && this.data.sort !== 4) {
                  this.setData({
                    sort: 3
                  });
                  isChange = true;
                } else {
                  this.setData({
                    sort: this.data.sort === 3 ? 4 : 3
                  });
                  isChange = true;
                }
                break;
              default:
                break;
          }
        }
        }else if(this.data.tk_type === "tb"){
          console.log("tb切换排序")
          switch(event.target.dataset.type) {
            case "zh":
              if (this.data.sort !== 0) {
                this.setData({
                  sort: 0
                });
                isChange = true;
              }
              break;
            case "rm":
              if (this.data.sort !== 1 && this.data.sort !== 2) {
                this.setData({
                  sort: 2
                });
                isChange = true;
              } else {
                this.setData({
                  sort: this.data.sort === 2 ? 1 : 2
                });
                isChange = true;
              }
              break;
            case "xl":
              if (this.data.sort !== 6 && this.data.sort !== 7) {
                this.setData({
                  sort: 7
                });
                isChange = true;
              } else {
                this.setData({
                  sort: this.data.sort === 7 ? 6 : 7
                });
                isChange = true;
              }
              break;
            case "jg":
              if (this.data.sort !== 3 && this.data.sort !== 4) {
                this.setData({
                  sort: 3
                });
                isChange = true;
              } else {
                this.setData({
                  sort: this.data.sort === 3 ? 4 : 3
                });
                isChange = true;
              }
              break;
            default:
              break;
          }          
        }
      }
        if (isChange) {
          this.reloadData();
        }
  },
  onLoad: function (options) {
    this.setData({
      searchVal: options.searchVal,
      tk_type: options.tk_type
    })
    this.reloadHistory();
    this.searchContent();
  },
})