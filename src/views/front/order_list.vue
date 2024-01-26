<template>
	<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
		<el-form-item prop="keyword">
			<el-input v-model="dataForm.keyword" placeholder="套餐标题/订单编号" size="medium" class="keyword" maxlength="32"
				clearable="clearable"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button size="medium" type="primary" :icon="Search" @click="searchHandle()">查询</el-button>
		</el-form-item>
		<el-form-item class="mold">
			<el-radio-group v-model="dataForm.statusLabel" size="medium" @change="searchHandle()">
				<el-radio-button label="全部"></el-radio-button>
				<el-radio-button label="未付款"></el-radio-button>
				<el-radio-button label="已付款"></el-radio-button>
			</el-radio-group>
		</el-form-item>
	</el-form>
	<div class="order-list" v-show="!empty">
		<div class="order" v-for="one in data.dataList">
			<div class="header">
				<div class="datetime">
					{{one.createTime}}
				</div>
				<div class="uuid">
					订单号：
					<span>{{one.outTradeNo}}</span>
				</div>
				<div class="detail" @click="searchDetailHandle(one.snapshotId)">
					查看商品详情
				</div>
			</div>
			<div class="content">
				<img :src="one.goodsImage" class="image" />
				<div class="info">
					<h4>{{one.goodsTitle}}</h4>
					<p>{{one.goodsDescription}}</p>
				</div>
				<div class="price">
					<span class="label">套餐单价</span>
					<span class="value">￥{{one.goodsPrice}}</span>
				</div>
				<div class="number">
					<span class="label">购买数量</span>
					<span class="value">×{{one.number}}</span>
				</div>
				<div class="amount">
					<span class="label">合计</span>
					<span class="value">￥{{one.amount}}</span>
				</div>
				<div class="status">
					<span class="label">状态</span>
					<span class="value">{{one.status}}</span>
				</div>
				<div class="operate">
					<el-button v-if="one.status == '未付款'" type="primary" :disabled="one.disabled"
						@click="paymentHandle(one.outTradeNo)">
						付款</el-button>
					<el-button v-if="one.status == '未付款'" type="danger" @click="closeOrderHandle(one.id)">
						取消订单</el-button>
					<el-button v-if="one.status == '已付款'" type="primary" :disabled="one.appointCount == one.number"
						@click="appointHandle(one.id, one.number, one.appointCount)">
						预约体检</el-button>
					<el-button v-if="one.status =='已结束'">获取发票</el-button>
					<el-button v-if="one.status =='已付款'" type="danger" :disabled="one.appointCount > 0"
						@click="refundHandle(one.id)">
						退款
					</el-button>
				</div>
			</div>
		</div>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
	</div>
	<div class="empty" v-show="empty">
		<el-empty :image-size="200" />
	</div>
	<el-dialog title="支付订单" :close-on-click-modal="false" v-model="payOrderDialog.visible" width="305px" center>
		<img :src="payOrderDialog.qrCode" class="qrCode" v-if="!payOrderDialog.result" />
		<div v-if="payOrderDialog.result" class="pay-success">
			<el-result icon="success" title="付款成功" subTitle="请根据提示进行操作"></el-result>
		</div>
		<div class="dialog-footer-style">
			<el-button type="danger" size="medium" v-if="!payOrderDialog.result" @click="closeHandle">
				取消支付
			</el-button>
			<el-button type="primary" size="medium" v-if="!payOrderDialog.result" @click="successHandle">
				支付成功
			</el-button>
			<el-button type="primary" size="medium" v-if="!payOrderDialog.result" @click="closeHandle">
				关闭窗口
			</el-button>
		</div>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import router from '../../router/index';

	import { dayjs } from 'element-plus';
	import isBetween from 'dayjs/plugin/isBetween';
	dayjs.extend(isBetween);

	const { proxy } = getCurrentInstance();

	let empty = ref(false);

	const dataForm = reactive({
		keyword: null,
		statusLabel: '全部',
		status: null
	});

	const dataRule = reactive({
		keyword: [
			{ required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,32}$', message: '关键字内容不正确' }
		]
	});

	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false
	});

	const payOrderDialog = reactive({
		visible: false,
		result: false,
		qrCode: null,
		outTradeNo: null//订单流水号，查询付款结果时候用
	});

	function loadDataList() {
		data.loading = true;

		if (dataForm.statusLabel == '全部') {
			dataForm.status = null;
		} else if (dataForm.statusLabel == '未付款') {
			dataForm.status = 1;
		} else {
			dataForm.status = 3;
		}
		let json = {
			page: data.pageIndex,
			length: data.pageSize,
			keyword: dataForm.keyword,
			status: dataForm.status,
		};
		proxy.$http('/front/order/searchByPage', 'POST', json, true, function (resp) {
			console.log(resp.page);
			let statusEnum = {
				'1': '未付款',
				'2': '已关闭',
				'3': '已付款',
				'4': '已退款',
				'5': '已预约',
				'6': '已结束',
			};
			let page = resp.page;
			let list = page.list;
			for (let one of list) {
				one.goodsImage = `${proxy.$minioUrl}/${one.goodsImage}`;
				one.status = statusEnum[one.status + ""];
			}
			data.dataList = list;
			data.totalCount = page.totalCount;
			data.loading = false;
			empty = (list.length == 0);
		});
	}
	loadDataList();

	function searchHandle() {
		proxy.$refs['form'].validate(valid => {
			if (valid) {
				proxy.$refs['form'].clearValidate();
				if (dataForm.keyword == '') {
					dataForm.keyword = null;
				}
				if (dataForm.status == '') {
					dataForm.status = null;
				}
				loadDataList();
			} else {
				return false;
			}
		});
	}

	function sizeChangeHandle(val) {
		data.pageSize = val;
		data.pageIndex = 1;
		loadDataList();
	}

	function currentChangeHandle(val) {
		data.pageIndex = val;
		loadDataList();
	}

	function refundHandle(id) {
		proxy.$confirm(`您确定要执行退款？`, '提示信息', {
			confirmButtonText: '确定',
			cancelButonText: '取消',
			type: 'warning'
		}).then(() => {
			let json = { id: id };
			proxy.$http('/front/order/refund', 'POST', json, true, function (resp) {
				if (resp.result) {
					proxy.$message({
						message: '已经申请原路退回款项，稍后请查收退款',
						type: 'success',
						duration: 1200,
						onClose: () => {
							loadDataList();
						}
					});
					loadDataList();
				} else {
					proxy.$message({
						message: '退款申请失败，请联系客服',
						type: 'error',
						duration: 1200
					});
				}
			});
		});
	}

	function paymentHandle(outTradeNo) {
		payOrderDialog.outTradeNo = outTradeNo;
		payOrderDialog.qrCode = null;
		payOrderDialog.result = false;
		proxy.$confirm(`您确定购买该体检套餐？`, '提示信息', {
			confirmButtonText: '确定',
			cancelButtonText: '取消'
		}).then(() => {
			let json = { outTradeNo: outTradeNo };
			console.log(json);
			proxy.$http('/front/order/payOrder', 'POST', json, true, function (resp) {
				if (resp.result) {
					payOrderDialog.visible = true;
					payOrderDialog.qrCode = resp.qrCodeBase64;
					//websocket 去接收后端推送的付款结果
					let token = localStorage.getItem('token');
					proxy.$socket.sendObj({ opt: 'customer_payment', identity: 'customer', token: token });
					proxy.$options.sockets.onmessage = function (resp) {
						let data = resp.data;
						let json = JSON.parse(data);
						if (json.result) {
							payOrderDialog.result = true;
							delete proxy.$options.sockets.onmessage;//删除消息监听
							loadDataList();
						}
					};
				} else {
					ElMessageBox.alert('该订单已经超出支付期，请重新下单付款', '提示信息', {});
				}
			});
		});
	}

	function successHandle() {
		//查询付款状态
		let json = { outTradeNo: payOrderDialog.outTradeNo };
		proxy.$http('/front/order/searchPaymentResult', 'POST', json, true, function (resp) {
			if (resp.result) {
				payOrderDialog.visible = false;
				proxy.$message({
					message: '付款成功',
					type: 'success',
					duration: 1200
				});
				loadDataList();
			} else {
				proxy.$message({
					message: '付款不成功',
					type: 'error',
					duration: 1200
				});
			}
		});
	}

	function closeHandle() {
		payOrderDialog.visible = false;
	}

	function closeOrderHandle(id) {
		proxy.$confirm(`您确定要关闭订单？`, '提示信息', {
			confirmButtonText: '确定',
			cancelButtonText: '取消'
		}).then(() => {
			let json = { id: id };
			proxy.$http('/front/order/closeOrderById', 'POST', json, true, function (resp) {
				if (resp.result) {
					proxy.$message({
						message: '订单已关闭',
						type: 'success',
						duration: 1200,
						onClose: () => {
							loadDataList();
						}
					});
				} else {
					proxy.$message({
						message: '订单关闭失败',
						type: 'error',
						duration: 1200
					});
				}
			});
		});
	}
	// const data = reactive({
	// 	dataList: [
	// 		{
	// 			createTime: "2024-01-01 12:30:27",
	// 			outTradeNo: "25A05215E4AC4B6C949C17857D51A5FC",
	// 			snapshotId: "123456",
	// 			goodsImage: `${proxy.$minioUrl}/front/goods/3510fb377af44dc3a2320e7bfa81e8f1.jpg`,
	// 			goodsTitle: "新感恩敬老中级体检套餐",
	// 			goodsDescription: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
	// 			goodsPrice: 1800,
	// 			number: 2,
	// 			amount: 3600,
	// 			status: "已付款"
	// 		},
	// 		{
	// 			createTime: "2024-01-01 12:30:27",
	// 			outTradeNo: "25A05215E4AC4B6C949C17857D51A5FC",
	// 			snapshotId: "123456",
	// 			goodsImage: `${proxy.$minioUrl}/front/goods/3510fb377af44dc3a2320e7bfa81e8f1.jpg`,
	// 			goodsTitle: "新感恩敬老中级体检套餐",
	// 			goodsDescription: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
	// 			goodsPrice: 1800,
	// 			number: 2,
	// 			amount: 3600,
	// 			status: "已付款"
	// 		},
	// 		{
	// 			createTime: "2024-01-01 12:30:27",
	// 			outTradeNo: "25A05215E4AC4B6C949C17857D51A5FC",
	// 			snapshotId: "123456",
	// 			goodsImage: `${proxy.$minioUrl}/front/goods/3510fb377af44dc3a2320e7bfa81e8f1.jpg`,
	// 			goodsTitle: "新感恩敬老中级体检套餐",
	// 			goodsDescription: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
	// 			goodsPrice: 1800,
	// 			number: 2,
	// 			amount: 3600,
	// 			status: "已付款"
	// 		},
	// 		{
	// 			createTime: "2024-01-01 12:30:27",
	// 			outTradeNo: "25A05215E4AC4B6C949C17857D51A5FC",
	// 			snapshotId: "123456",
	// 			goodsImage: `${proxy.$minioUrl}/front/goods/3510fb377af44dc3a2320e7bfa81e8f1.jpg`,
	// 			goodsTitle: "新感恩敬老中级体检套餐",
	// 			goodsDescription: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
	// 			goodsPrice: 1800,
	// 			number: 2,
	// 			amount: 3600,
	// 			status: "已付款"
	// 		}
	// 	],
	// 	pageIndex: 1,
	// 	pageSize: 10,
	// 	totalCount: 0,
	// 	loading: false
	// });
</script>

<style lang="less" scoped>
	@import url(order_list.less);
</style>