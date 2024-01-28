<template>
	<div v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item prop="code">
				<el-input v-model="dataForm.code" placeholder="套餐编号" maxlength="20" class="input"
					clearable="clearable" />
			</el-form-item>
			<el-form-item prop="keyword">
				<el-input v-model="dataForm.keyword" placeholder="套餐名称" maxlength="50" clearable="clearable" />
			</el-form-item>
			<el-form-item prop="tel">
				<el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input"
					clearable="clearable" />
			</el-form-item>
			<el-form-item class="range">
				<el-date-picker v-model="dataForm.dataRange" type="daterange" range-separator="~"
					start-placeholder="起始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
			</el-form-item>
			<el-form-item>
				<el-select v-model="dataForm.status" class="input" placeholder="订单状态" clearable="clearable">
					<el-option label="未付款" value="1"></el-option>
					<el-option label="已关闭" value="2"></el-option>
					<el-option label="已付款" value="3"></el-option>
					<el-option label="已退款" value="4"></el-option>
					<el-option label="已预约" value="5"></el-option>
					<el-option label="已结束" value="6"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" v-if="proxy.isAuth(['ROOT', 'ORDER:UPDATE'])" :icon="Refresh"
					@click="checkPaymentResultHandle()">同步付款结果</el-button>
			</el-form-item>
		</el-form>
		<el-table :data="data.dataList" :header-cell-style="{'backgroud':'#f5f7fa'}" border v-loading="data.loading"
			@selection-change="selectionChangeHandle" @expand-change="expand" :row-key="data.getRowKeys"
			:expand-row-keys="data.expands">
			<el-table-column type="expand">
				<!--折叠面板-->
				<template #default="scope">
					<div class="content-container">
						<div class="left-panel">
							<el-card class="box-card" shadow="never">
								<div class="info">
									<div class="left">
										<el-avatar :size="57" shape="square" :src="scope.row.photo">
											<el-icon size="35">
												<UserFilled />
											</el-icon>
										</el-avatar>
									</div>
									<div class="right">
										<h4 class="customer-name">{{scope.row.name}}</h4>
										<p class="customer-desc">
											<el-icon class="icon">
												<User />
											</el-icon>
											<span class="value">{{scope.row.sex}}</span>
											<el-icon class="icon">
												<Phone />
											</el-icon>
											<span class="value">{{scope.row.tel}}</span>
											<el-icon class="icon">
												<Calendar />
											</el-icon>
											<span class="value">{{scope.row.registerTime}}</span>
										</p>
									</div>
								</div>
								<el-divider />
								<el-row :gutter="16">
									<el-col :span="6">
										<div class="statistic-card">
											<el-statistic :value="scope.row.number-scope.row.num" suffix="个">
												<template #title>
													<div class="title">可预约体检</div>
												</template>
											</el-statistic>
										</div>
									</el-col>
									<el-col :span="6">
										<div class="statistic-card">
											<el-statistic :value="scope.row.num" suffix="个">
												<template #title>
													<div class="title">已预约体检</div>
												</template>
											</el-statistic>
										</div>
									</el-col>
									<el-col :span="6">
										<div class="statistic-card">
											<el-statistic :value="scope.row.number" suffix="个">
												<template #title>
													<div class="title">总计数量</div>
												</template>
											</el-statistic>
										</div>
									</el-col>
								</el-row>
							</el-card>
							<el-descriptions :column="1" class="order-code" border>
								<el-descriptions-item label="订单编号：" label-align="center">
									{{scope.row.outTradeNo}}
								</el-descriptions-item>
								<el-descriptions-item label="付款编号：" label-align="center">
									{{scope.row.transactionId==null?"无":scope.row.transactionId}}
								</el-descriptions-item>
								<el-descriptions-item label="退款编号：" label-align="center">
									{{scope.row.outRefundNo==null?"无":scope.row.outRefundNo}}
								</el-descriptions-item>
							</el-descriptions>
						</div>
						<div class="right-panel">
							<el-table :data="data.appointment" :header-cell-style="{'background':'#f5f7fa'}"
								height="350" border>
								<el-table-column label="序号" type="index" label-align="center" align="center"
									min-width="90">
									<template #default="scope">
										<span>{{ scope.$index + 1 }}</span>
									</template>
								</el-table-column>
								<el-table-column prop="name" label="体检人" label-align="center" align="center"
									min-width="180" />
								<el-table-column prop="sex" label="性别" label-align="center" align="center"
									min-width="120" />
								<el-table-column prop="age" label="年龄" label-align="center" align="center"
									min-width="120" />
								<el-table-column prop="tel" label="电话" label-align="center" align="center"
									min-width="180" />
								<el-table-column prop="date" label="体检日" label-align="center" align="center"
									min-width="180" />
								<el-table-column prop="status" label="状态" label-align="center" align="center"
									min-width="130" />
							</el-table>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column type="selection" header-align="center" align="center" width="50"
				:selectable="selectable" />
			<el-table-column type="index" header-align="center" align="center" width="100" label="序号">
				<template #default="scope">
					<span>{{(data.pageIndex - 1) * data.pageSize + scope.$index + 1}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="goodsTitle" header-align="left" align="left" min-width="220" label="套餐名称" />
			<el-table-column header-align="center" align="center" min-width="80" label="价格">
				<template #default="scope">
					<span>￥{{scope.row.goodsPrice}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="number" header-align="center" align="center" min-width="100" label="数量" />
			<el-table-column header-align="center" align="center" min-width="100" label="总计">
				<template #default="scope">
					<span>￥{{scope.row.amount}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="status" header-align="center" align="center" min-width="100" label="状态" />
			<el-table-column prop="createTime" header-align="center" align="center" min-width="100" label="下单时间" />
			<el-table-column prop="refundTime" header-align="center" align="center" min-width="100" label="退款时间" />
			<el-table-column header-align="center" align="center" width="200" label="操作">
				<template #default="scope">
					<el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])"
						@click="viewHandle(scope.row.snapshotId)">预览</el-button>
					<el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:DELETE'])"
						:disabled="scope.row.status!='已关闭'" @click="deleteHandle(scope.row.id)">删除</el-button>
					<el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:UPDATE'])"
						:disabled="scope.row.status!='已付款'" @click="updateHandle(scope.row.id)">
						线下退款
					</el-button>

				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
		</el-pagination>
	</div>
</template>

<script lang="ts" setup>
	import { getCurrentInstance, reactive, ref } from 'vue';
	import router from '../../router/index';
	import { Refresh } from '@element-plus/icons-vue'

	const { proxy } = getCurrentInstance();

	const dataForm = reactive({
		code: null,
		keyword: null,
		tel: null,
		dataRange: [],
		status: null
	});

	//这部分内容将来给APP程序使用
	const dataRule = reactive({
		code: [
			{ min: 6, message: '编号不能少于6个字符' },
			{ pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
		],
		keword: [
			{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '名称格式错误' }
		],
		tel: [
			{ pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }
		]
	});
	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false,
		selections: [],
		expands: [],
		getRowKeys(row) {
			return row.id
		},
		appointment: []
	});
	function loadDataList() {
		data.loading = true;
		let range = dataForm.dataRange
		let json = {
			page: data.pageIndex,
			length: data.pageSize,
			keyword: dataForm.keyword,
			code: dataForm.code,
			tel: dataForm.tel,
			status: dataForm.status,
			startDate: (range != null && range.length == 2) ? range[0] : null,
			endDate: (range != null && range.length == 2) ? range[1] : null,
		};
		proxy.$http('/mis/order/searchByPage', 'POST', json, true, function (resp) {
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
				one.status = statusEnum[one.status + ""];
			}
			data.dataList = list;
			data.totalCount = page.totalCount;
			data.loading = false;
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
				if (dataForm.code == '') {
					dataForm.code = null;
				}
				if (dataForm.tel == '') {
					dataForm.tel = null;
				}
				if (dataForm.status == '') {
					dataForm.status = null;
				}
				if (dataForm.pageIndex == 1) {
					dataForm.pageIndex = 1;
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

	function expand(row, expandRows) {
		if (expandRows.length > 0) {
			data.expands = [];
			if (row) {
				data.appointment = []
				let json = {
					orderId: row.id
				}
				proxy.$http('/mis/appointment/searchByOrderId', "POST", json, true, function (resp) {
					let result = resp.result
					let statusEnum = {
						"1": "未签到",
						"2": "已签到",
						"3": "已结束",
						"4": "已关闭"
					}
					for (let one of result) {
						one.status = statusEnum[one.status + ""]
					}
					data.appointment = result
				});
				data.expands.push(row.id);//展开订单记录的折叠面板 
			} else {
				data.expands = [];
			}
		}
	}

	function viewHandle(snapshotId) {
		router.push(
			{ name: 'FrontGoodsSnapshot', params: { id: snapshotId, mode: "mis" } }
		);
	}

	function selectable(row, index) {
		if (["未付款", "已关闭"].includes(row.status)) {
			return true;
		}
		return false;
	}

	function selectionChangeHandle(val) {
		data.selections = val;
	}

	function checkPaymentResultHandle() {
		//提取选中订单记录的订单流水号
		let outTradeNoArray = data.selections.map(item => {
			return item.outTradeNo;
		});
		if (outTradeNoArray == null || outTradeNoArray.length == 0) {
			proxy.$message({
				message: '没有选中记录',
				type: 'error',
				duration: 1200
			});
			return;
		}
		let json = { outTradeNoArray: outTradeNoArray };
		proxy.$http('/mis/order/checkPaymentResult', 'POST', json, true, function (resp) {
			if (resp.rows > 0) {
				proxy.$message({
					message: `成功同步了${resp.rows}条付款记录`,
					type: 'success',
					duration: 1200,
					onClose: () => {
						loadDataList();
					}
				});
			} else {
				proxy.$message({
					message: '没有查询到这些订单付款成功',
					type: 'warning',
					duration: 1200,
				});
			}
		});
	}

	function deleteHandle(id) {
		proxy.$confirm(`确定要删除这条订单记录？`, '提示', {
			confirmButtonText: '确定',
			cancelButonText: '取消',
			type: 'warning'
		}).then(() => {
			let json = { "id": id };
			proxy.$http('/mis/order/deleteById', 'POST', json, true, function (resp) {
				if (resp.rows > 0) {
					proxy.$message({
						message: '操作成功',
						type: 'success',
						duration: 1200,
						onClose: () => {
							loadDataList();
						}
					});
				} else {
					proxy.$message({
						message: '未能删除记录',
						type: 'warning',
						duration: 1200
					});
				}
			});
		});
	}

	function updateHandle(id) {
		proxy.$confirm(`确定该订单已经线下退款成功？`, '提示', {
			confirmButtonText: '确定',
			cancelButonText: '取消',
			type: 'warning'
		}).then(() => {
			let json = { "id": id };
			proxy.$http('/mis/order/updateRefundStatusById', 'POST', json, true, function (resp) {
				if (resp.rows > 0) {
					proxy.$message({
						message: '操作成功',
						type: 'success',
						duration: 1200,
						onClose: () => {
							loadDataList();
						}
					});
				} else {
					proxy.$message({
						message: '未能更新订单状态',
						type: 'warning',
						duration: 1200
					});
				}
			});
		});
	}
</script>

<style lang="less" scoped>
	@import url('order.less');
</style>