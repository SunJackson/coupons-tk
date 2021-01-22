// components/production.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productions: Array,
    tk_type: String,
    is_stype: String, 
  },

  attached: function() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
    clickOnProduction: function(event) {
      wx.navigateTo({
        url: '/pages/detail/detail?gid=' + event.currentTarget.dataset.gid + '&search_id=' + event.currentTarget.dataset.searchid + '&tk_type=' + event.currentTarget.dataset.tktype + '&goods_url=' + event.currentTarget.dataset.goods_url +'&is_stype=' + event.currentTarget.dataset.isstype + '&production=' + JSON.stringify(event.currentTarget.dataset.production),
      });
    },
  }
})
