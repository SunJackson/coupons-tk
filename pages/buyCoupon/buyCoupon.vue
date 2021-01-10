<template>
	<view class="container">
		
		<u-sticky class="top">
			<view class="search">
				<u-search placeholder="搜索商品" v-model="title" :clearabled="true" @search="searchShop()"></u-search>
			</view>
			<u-subsection :list="subsectionList" :current=current mode="subsection" active-color="#dea048" inactive-color="#e3e3e3" @change="sectionChange"></u-subsection>
		</u-sticky>
		
		
		<view class="shop-main">
			<view class="shop flex-column" v-for="(shop ,index) in shops" :key="index">
				<u-lazy-load threshold="-450" border-radius="10" :image="shop.pict_url"></u-lazy-load>
				<!-- <u-image width="100%" class="image" height="56%" style="border-radius: 15px;" :src="shop.pict_url" mode="widthFix"></u-image> -->
				<view class="sho-info">
					<view class="shop-title flex-row">
						<!-- <view class="type">天猫</view> -->
						<view class="title">{{shop.short_title}}</view>
					</view>
					<view class="coupon-title flex-row">券后	<text class="nowMoney flex-row"><text>￥</text><text class="money">{{shop.zk_final_price}}</text></text>
						<text class="oldMoney flex-row">
							<text>￥</text><text class="money">{{shop.reserve_price}}</text>
						</text>
					</view>
					<view class="yishou">已售 {{shop.volume}} 件</view>
				</view>
				<view class="button" @click="getShopLink(shop)">获取优惠券</view>
			</view>
		</view>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
		<u-loadmore :status="status" class="loadMore" />
		<u-toast ref="uToast" />
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scrollTop: 0,
				cashShops: [[], []],
				shops: [],
				title: "",
				status: 'loadmore',
				pageIndex: [1, 1],
				pddPageIndex: 1,
				pageSize: 10,
				subsectionList: [
					{
						name: '淘宝'
					},
					{
						name: '拼多多'
					}
				],
				current: 1
			}
		},
		onShareAppMessage(res) {
			var imagesList = ['../../static/taobaoshare.jpg', '../../static/pinduoduoshare.jpg'];
			return {   
				"title": "这里有大量"+this.list[this.current].name+"优惠券等你来拿！",
				"path": "pages/buyCoupon/buyCoupon",
				"imageUrl" : imagesList[this.current],
				};
		},
		onShareTimeline() {
			var imagesList = ['../../static/taobaoshare.jpg', '../../static/pinduoduoshare.jpg'];
			return {   
				"title": "这里有大量"+this.list[this.current].name+"优惠券等你来拿！",
				"path": "pages/buyCoupon/buyCoupon",
				"imageUrl" : imagesList[this.current],
				};
		},
		methods: {
			sectionChange(index) {
				this.current = index;
				console.log(this.current)
				console.log(this.cashShops[this.current].length)
				if (this.current == 0 && this.cashShops[this.current].length == 0){
					
					this.init();
				}else if (this.current == 1 && this.cashShops[this.current].length == 0){

					this.init();
				}else{
					this.shops = this.cashShops[this.current]
				};
				
			},
			getShopLink: function(shop){
				const _this = this;
				if (this.current == 0){
					this.$http.sendRequest('tbTpwdCreate', 'POST', {
						url: 'https:' +shop.url,
						text: shop.short_title,
						logo: shop.pict_url
						
					}).then(res => {
						console.log(res.data)
						if (res.data.error_code != 0) {
							_this.$refs.uToast.show({
								title: "抱歉~没有优惠券!",
								type: 'error'
							})
							return;
						}
						uni.setClipboardData({
							data: res.data.data,
							success: function() {
								uni.hideToast()
								_this.$refs.uToast.show({
									title: "口令复制成功!",
									type: "success",
									
								})
							},
							fail: function(err) {
								_this.$refs.uToast.show({
									title: "剪切板复制失败!",
									type: 'error'
								})
							}
						});
					});
				}
				else if(this.current == 1){
					this.$http.sendRequest('pddPromotionUrlGenerate', 'POST', {
						generate_short_url: true,
						multi_group: true,
						generate_we_app: true,
						goods_id: shop.goods_id
						
					}).then(res => {
						console.log(res.data)
						if (res.data.error_code != 0) {
							_this.$refs.uToast.show({
								title: "抱歉~没有优惠券!",
								type: 'error'
							})
							return;
						};
						const list = res.data.data.goods_promotion_url_generate_response.goods_promotion_url_list;
						
						if (list.length > 0) {
						  const r = list[0];
						
						  if (r.we_app_info) {
						    uni.navigateToMiniProgram({
						      appId: r.we_app_info.app_id,
						      path: r.we_app_info.page_path
						    });
						  }
						}
						
					});
					console.log('pdd领优惠')
				}
				
			},
			//返回最上
			onPageScroll(e) {
				this.scrollTop = e.scrollTop;
			},
			//加载更多
			onReachBottom() {
				this.pageIndex[this.current] += 1;
				this.init();
			},
			searchShop: function() {
				this.shops = [];
				this.pageIndex[this.current] = 1;
				this.init();
			},
			init: function() {
				uni.showLoading({
					title: '加载商品'
				});
				this.status = 'loading';
				if (this.pageIndex[this.current] == 1){
					this.cashShops[this.current] = []
				}
				if (this.current === 0){
					var params = {
							q: this.title,
							page_no: this.pageIndex[this.current],
							page_size: this.pageSize,
					}
					if(this.title == ''){
						params['cat'] = '3,4,1,6,16,21';
						params['start_dsr'] = 500;
					}
					this.$http.sendRequest('tbSearch','POST', params).then(res => {
						uni.hideLoading();
						if (res.data.error_code != 0) {
							return;
						}
						this.cashShops[this.current] = this.cashShops[this.current].concat(res.data.data);
						this.shops = this.cashShops[this.current];
						console.log(this.shops)
					});
				}else{
					var params = {
							keyword: this.title,
							sort_type: 0,
							page_size: this.pageSize,
							page: this.pageIndex[this.current],
					}
					console.log(params)
					this.$http.sendRequest('pddSearch','POST', params).then(res => {
						uni.hideLoading();
						if (res.data.error_code != 0) {
							return;
						}
						this.cashShops[this.current] = this.cashShops[this.current].concat(res.data.data);
						this.shops = this.cashShops[this.current];
						console.log(this.shops)
					});
				}
				
			}
		},

		onShow() {
			
			this.init()
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #eeeeee;
	}

	.container {
		display: flex;
		flex-direction: column;

		.loadMore {
			padding: 10px 0px 20px 0px;
		}

		.top {
			width: 100%;
			height: 20%;

			.search {
				width: 100%;
				background-color: #ffffff;
				width: 750rpx;
				height: 120rpx;
				background-color: #ffffff;
				color: #fff;
				padding: 24rpx;

			}
		}

		.shop-main {
			padding: 10px;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;
			.shop {
				width: 49%;
				height: 50%;
				background-color: #FFFFFF;
				border-radius: 15px;
				box-sizing: border-box;
				margin-bottom: 10px;
				box-shadow: 0 2px 27px 6px #d6d6d6;


				.sho-info {
					padding: 0 5px;

					.shop-title {
						font-weight: bold;
						align-items: center;
						align-content: center;

						.type {
							background-color: #ff002e;
							color: #FFFFFF;
							text-align: center;
							width: 100%;
							//padding: 0px 3px;
						}

						.title {
							//对超出内容隐藏
							overflow: hidden;
							//显示省略符号来代表被修剪的文本
							text-overflow: ellipsis;
							//文本不会换行，文本会在在同一行上继续，直到遇到 <br> 标签为止。
							white-space: nowrap;
						}
					}

					.coupon-title {
						color: #fe4e06;
						align-items: center;

						.nowMoney {
							color: #fd4800;
							align-items: center;

							.money {
								font-weight: bold;
								font-size: 18px;
							}
						}

						.oldMoney {
							color: #999999;
							align-items: center;

							.money {
								text-decoration: line-through;
							}
						}
					}

					.yishou {
						color: #999999;
					}
				}

				.button {
					text-align: center;
					color: #FFFFFF;
					background-color: #fe530e;
					padding: 5px;
					margin-top: 5px;
					border-bottom-left-radius: 10px;
					border-bottom-right-radius: 10px;
				}
			}
		}


	}
</style>
