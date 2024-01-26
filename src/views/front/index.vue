<template>
	<img src="../../assets/front/index/banner.webp" class="banner" />
	<div class="search-container">
		<div class="service">
			<img src="../../assets/front/index/service-icon-1.png" />
			<div>
				<h4>体检预约</h4>
				<p>一战式预约服务</p>
			</div>
		</div>
		<div class="service">
			<img src="../../assets/front/index/service-icon-2.png" />
			<div>
				<h4>报告查询</h4>
				<p>体检报告快速查询</p>
			</div>
		</div>
		<div class="service">
			<img src="../../assets/front/index/service-icon-3.png" />
			<div>
				<h4>活动热卖</h4>
				<p>当季推荐特惠商品</p>
			</div>
		</div>
		<div class="service">
			<img src="../../assets/front/index/service-icon-4.png" />
			<div>
				<h4>企业专区</h4>
				<p>企业专属健康服务</p>
			</div>
		</div>
	</div>
	<div class="goods-container">
		<nav>
			<h3>活动专区</h3>
			<el-link :icon="Plus" :underline="false" @click="moreHandle">查看更多</el-link>
		</nav>
		<ul class="goods-list">
			<li class="item" v-for="one in data.part_1">
				<div class="card">
					<img :src="one.image" />
					<h4> {{one.title}}</h4>
					<el-tooltip class="box-item" effect="dark" placement="top">
						<template #content>
							<div style="width: 260px;">{{one.description}}</div>
						</template>
						<p class="desc">
							<span>折</span>
							{{one.description}}
						</p>
					</el-tooltip>
					<p class="price">
						<span class="current">￥{{one.currentPrice}}</span>
						<span class="old">￥ {{one. initialPrice}}</span>
						<span class="sale">已售{{one.salesVolume}}</span>
					</p>
					<input type="button" class="buy-btn" value="立即购买" @click="buyHandle(one.id)" />
				</div>
			</li>
		</ul>
	</div>

	<div class="goods-container">
		<nav>
			<h3>热卖套餐</h3>
			<el-link :icon="Plus" :underline="false" @click="moreHandle">查看更多</el-link>
		</nav>
		<ul class="goods-list">
			<li class="item" v-for="one in data.part_2">
				<div class="card">
					<img :src="one.image" />
					<h4>{{one.title}}</h4>
					<el-tooltip class="box-item" effect="dark" placement="top">
						<template #content>
							<div style="width: 260px;">{{one.description}}</div>
						</template>
						<p class="desc">
							<span>折</span>
							{{one.description}}
						</p>
					</el-tooltip>
					<p class="price">
						<span class="current">￥{{one.currentPrice}}</span>
						<span class="old">￥ {{one. initialPrice}}</span>
						<span class="sale">已售{{one.salesVolume}}</span>
					</p>
					<input type="button" class="buy-btn" value="立即购买" @click="buyHandle(one.id)" />
				</div>
			</li>
		</ul>
	</div>

	<div class="goods-container">
		<nav>
			<h3>新品推荐</h3>
			<el-link :icon="Plus" :underline="false" @click="moreHandle">查看更多</el-link>
		</nav>
		<ul class="goods-list">
			<li class="item" v-for="one in data.part_3">
				<div class="card">
					<img :src="one.image" />
					<h4>{{one.title}}</h4>
					<el-tooltip class="box-item" effect="dark" placement="top">
						<template #content>
							<div style="width: 260px;">{{one.description}}</div>
						</template>
						<p class="desc">
							<span>折</span>
							{{one.description}}
						</p>
					</el-tooltip>
					<p class="price">
						<span class="current">￥{{one.currentPrice}}</span>
						<span class="old">￥ {{one. initialPrice}}</span>
						<span class="sale">已售{{one.salesVolume}}</span>
					</p>
					<input type="button" class="buy-btn" value="立即购买" @click="buyHandle(one.id)" />
				</div>
			</li>
		</ul>
	</div>

	<div class="partner-container">
		<h3>-&nbsp;&nbsp;合作伙伴&nbsp;&nbsp;-</h3>
		<el-carousel height="220px" :autoplay="false">
			<el-carousel-item>
				<el-row :gutter="20">
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c1.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c2.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c3.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c4.png" />
					</el-col>
				</el-row>
				<el-row :gutter="20">
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c5.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c6.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c7.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c8.png" />
					</el-col>
				</el-row>
			</el-carousel-item>
			<el-carousel-item>
				<el-row :gutter="20">
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c9.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c10.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c11.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c12.png" />
					</el-col>
				</el-row>
				<el-row :gutter="20">
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c13.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c14.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c15.png" />
					</el-col>
					<el-col :span="6">
						<img class="logo" src="../../assets/front/index/c16.png" />
					</el-col>
				</el-row>
			</el-carousel-item>
		</el-carousel>
	</div>
</template>

<script setup lang="ts">
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import { Plus } from '@element-plus/icons-vue';
	import router from '../../router/index';

	const { proxy } = getCurrentInstance();

	const data = reactive({
		part_1: [],
		part_2: [],
		part_3: [],
	});
	let json = {
		partIds: [1, 2, 3]
	};
	proxy.$http('/front/goods/searchIndexGoodsByPart', 'POST', json, true, function (resp) {
		let result = resp.result;
		//处理第1个区域的封面图片
		for (let one of result['1']) {
			one.image = `${proxy.$minioUrl}/${one.image}`;
		}
		data['part_1'] = result['1'];
		//处理第2个区域的封面图片
		for (let one of result['2']) {
			one.image = `${proxy.$minioUrl}/${one.image}`;
		}
		data['part_2'] = result['2'];
		//处理第3个区域的封面图片
		for (let one of result['3']) {
			one.image = `${proxy.$minioUrl}/${one.image}`;
		}
		data['part_3'] = result['3'];
	});

	function buyHandle(id) {
		router.push({ name: 'FrontGoods', params: { id: id } });
	}

	function moreHandle() {
		router.push({ name: 'FrontGoodsList' });
	}
</script>

<style lang="less" scoped>
	@import url('index.less');
</style>