<template>
	<el-breadcrumb separator="/" class="breadcrumb">
		<el-breadcrumb-item :to="{name: 'FrontIndex'}">首页</el-breadcrumb-item>
		<el-breadcrumb-item>体检套餐列表</el-breadcrumb-item>
	</el-breadcrumb>
	<div class="search-rows">
		<el-row gutter="0" class="row">
			<el-col :span="2"><span class="label">【分类】</span></el-col>
			<el-col :span="2" v-for="one in condition.type">
				<span :class="one.active ? 'item active' : 'item'" @click="selectHandle('type', one.name)">
					{{ one.name }}
				</span>
			</el-col>
		</el-row>
		<el-row gutter="0" class="row">
			<el-col :span="2">
				<span class="label">【性别】</span>
			</el-col>
			<el-col :span="2" v-for="one in condition.sex">
				<span :class="one.active ? 'item active' : 'item'" @click="selectHandle('sex', one.name)">
					{{one.name}}
				</span>
			</el-col>
		</el-row>
		<el-row gutter="0" class="row">
			<el-col :span="2">
				<span class="label">【价格】</span>
			</el-col>
			<el-col :span="2" v-for="one in condition.priceType">
				<span :class="one.active ? 'item active' :'item'" @click="selectHandle('priceType', one.name)">
					{{one.name}}
				</span>
			</el-col>
		</el-row>
	</div>
	<div class="search-filter">
		<el-radio-group v-model="radio" @change="selectRadio">
			<el-radio label="最新" size="large">最新</el-radio>
			<el-radio label="销量" size="large">销量</el-radio>
		</el-radio-group>
		<div class="sort-operate" @click="selectPrice">
			<span>价格</span>
			<SvgIcon :name="priceOrder.icon" class="sort-icon"></SvgIcon>
		</div>
	</div>

	<div class="goods-container">
		<el-empty description="无体检套餐" image-size="200" v-if="data.dataList.length == 0" />
		<ul class="goods-list" v-infinite-scroll="load">
			<li class="item" v-for="(one, index) in data.dataList" :style="(index + 1) % 4 == 0 ? 'margin-right:0' :''">
				<div class="card">
					<img :src="one.image" />
					<h4>{{one.title}}</h4>
					<el-tooltip class="box-item" effect="dark" placement="top">
						<template #content>
							<div style="width: 260px">{{one.description}}</div>
						</template>
						<p class="desc">
							<span>折</span>
							{{one.description}}
						</p>
					</el-tooltip>
					<p class="price">
						<span class="current">￥{{one.currentPrice}}</span>
						<span class="old">￥{{one.initialPrice}}</span>
						<span class="sale">已售{{one.salesVolume}}</span>
					</p>
					<input type="button" class="buy-btn" value="立即购买" @click="buyHandle(one.id)" />
				</div>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import router from '../../router/index';
	import SvgIcon from '../../components/SvgIcon.vue';
	const { proxy } = getCurrentInstance();
	let radio = ref(null);

	const priceOrder = reactive({
		icon: 'sort-default',
		type: 'default'
	});

	const dataForm = reactive({
		keyword: null,
		type: null,
		sex: null,
		priceType: null,
		orderType: null,
	});
	
	//获取路由传递的参数
	let keyword = router.currentRoute.value.query.keyword;
	console.log(keyword);
	if (keyword == '' || keyword == null) {
		dataForm.keyword = null;
	} else {
		dataForm.keyword = keyword;
	}

	const condition = reactive({
		type: [
			{ name: '不限', active: true },
			{ name: '父母体检', active: false },
			{ name: '入职体检', active: false },
			{ name: '职场白领', active: false },
			{ name: '个人高端', active: false },
			{ name: '中青年体检', active: false }
		],
		sex: [
			{ name: '不限', active: true },
			{ name: '男性', active: false },
			{ name: '女性', active: false }
		],
		priceType: [
			{ name: '不限', active: true },
			{ name: '0~100', value: 1, active: false },
			{ name: '100~500', value: 2, active: false },
			{ name: '500~1000', value: 3, active: false },
			{ name: '1000以上', value: 4, active: false }
		]
	});

	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 12,
		totalCount: 0,
		isLast: false
	});
	//滚动到页面的顶部，否则路由跳转页面之后，页面垂直位置还是上一个页面的地方
	window.scrollTo(0, 0);

	function loadDataList() {
		//判断是否已经是最后一页
		if (data.isLast) {
			return
		}
		let json = {
			keyword: dataForm.keyword,
			type: dataForm.type,
			sex: dataForm.sex,
			priceType: dataForm.priceType,
			orderType: dataForm.orderType,
			page: data.pageIndex,
			length: data.pageSize
		};
		proxy.$http('/front/goods/searchListByPage', 'POST', json, true, function (resp) {
			let page = resp.page;
			let list = page.list;
			if (list == null || list.length == 0) {
				data.isLast = true;//记录再无分页数据
				data.pageIndex--;//d当前分页并不存在，页数减1作为最后一页
			} else {
				for (let one of list) {
					one.image = `${proxy.$minioUrl}/${one.image}`;
				}
				//追加数据
				data.dataList = data.dataList.concat(list);
				data.totalList = page.totalCount;
			}
		});
	}
	loadDataList();
	function load() {
		if (data.isLast) {//尾页不再调用
			return
		}
		data.pageIndex++;
		loadDataList();//加载下一页data
	}

	function selectHandle(key, name) {
		condition[key].forEach(function (one) {
			if (one.name == name) {
				one.active = true;
				if (key != 'priceType') {
					dataForm[key] = (one.name == '不限' ? null : one.name);
				} else {
					dataForm[key] = (one.name == '不限' ? null : one.value);
				}
			} else {
				one.active = false;
			}
		});
		data.dataList = [];
		data.pageIndex = 1;
		data.totalCount = 0;
		data.isLast = false;
		loadDataList();
	}

	function selectRadio(value : string) {
		priceOrder.icon = 'sort-default';
		priceOrder.type = 'default';
		if (value == '最新') {
			dataForm.orderType = 1;
		} else if (value == '销量') {
			dataForm.orderType = 2;
		}
		data.dataList = [];
		data.isLast = false;
		data.pageIndex = 1;
		data.totalCount = 0;
		loadDataList();
	}

	function selectPrice() {
		radio = ref(null);
		if (priceOrder.type == 'default') {
			priceOrder.icon = 'sort-asc';
			priceOrder.type = 'asc';
			dataForm.orderType = 3;
		} else if (priceOrder.type == 'asc') {
			priceOrder.icon = 'sort-desc';
			priceOrder.type = 'desc';
			dataForm.orderType = 4;
		} else if (priceOrder.type == 'desc') {
			priceOrder.icon = 'sort-asc';
			priceOrder.type = 'asc';
			dataForm.orderType = 3;
		}
		data.dataList = [];
		data.isLast = false;
		data.pageIndex = 1;
		data.totalCount = 0;
		loadDataList();
	}
	
	
</script>

<style lang="less" scoped>
	@import url('goods_list.less');
</style>