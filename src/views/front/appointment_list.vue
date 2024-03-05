<template>
	<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
		<el-form-item prop="keyword">
			<el-input v-model="dataForm.keyword" placeholder="套餐名称 / 姓名 / 电话" size="medium"></el-input>
		</el-form-item>
		<el-form-item class="date">
			<el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false" format="YYYY-MM-DD"
				value-format="YYYY-MM-DD"></el-date-picker>
		</el-form-item>
		<el-form-item>
			<el-button size="medium" type="primary" :icon="Search" @click="searchHandle()">查询</el-button>
		</el-form-item>
		<el-form-item class="mold">
			<el-radio-group v-model="dataForm.statusLabel" size="medium" @change="searchHandle()">
				<el-radio-button label="全部"></el-radio-button>
				<el-radio-button label="已结束"></el-radio-button>
			</el-radio-group>
		</el-form-item>
	</el-form>
	<div class="table-container" v-show="!empty">
		<el-table :data="data.dataList" class="appointment-table" :header-cell-style="{'background':'#f5f7fa'}" border
			v-loading="data.loading">
			<el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
				<template #default="scope">
					<span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="goodsTitle" header-align="center" align="center" label="套餐名称" min-width="250" />
			<el-table-column prop="name" header-align="center" align="center" label="体检人" min-width="120" />
			<el-table-column prop="date" header-align="center" align="center" label="预约日期" min-width="120" />
			<el-table-column prop="status" header-align="center" align="center" label="状态" min-width="120" />
			<el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
				<template #default="scope">
					<el-button type="text" :disabled="scope.row.filePath==null"
						@click="downloadHandle(scope.row.name, scope.row.filePath)">体检报告</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
		</el-pagination>
	</div>
	<div class="empty" v-show="empty">
		<el-empty :image-size="200"></el-empty>
	</div>
</template>

<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import router from '../../router/index';
	import { dayjs } from 'element-plus';
	import isBetween from 'dayjs/plugin/isBetween';
	dayjs.extend(isBetween);
	const { proxy } = getCurrentInstance();
	let empty = ref(true);
	const dataForm = reactive({
		keyword: null,
		date: null,
		status: null,
		statusLabel: '全部',
	});
	const dataRule = reactive({
		keyword: [
			{ required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,30}$', message: '关键字内容不正确' }
		]
	});
	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false
	});

	function loadDataList() {
		data.loading = true;
		if (dataForm.statusLabel == '全部') {
			dataForm.status = null;
		} else {
			dataForm.status = 4
		}
		let json = {
			page: data.pageIndex,
			length: data.pageSize,
			keyword: dataForm.keyword,
			date: dataForm.date,
			status: dataForm.status
		};
		proxy.$http('/front/appointment/searchByPage', 'POST', json, true, function (resp) {
			let statusEnum = {
				"1": "未签到",
				"2": "已签到",
				"3": "已结束",
				"4": "已关闭"
			};
			let page = resp.page;
			let list = page.list;
			for (let one of list) {
				one.status = statusEnum[one.status + ""]
				if (one.filePath != null) {
					one.filePath = `${proxy.$minioUrl}/${one.filePath}`
				}
			}
			data.dataList = list;
			data.totalCount = page.totalCount;
			data.loading = false;
			empty = list.length == 0;
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
				if (dataForm.date == '') {
					dataForm.date = null;
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

	function downloadHandle(name, filePath) {
		let a = document.createElement('a');
		a.href = filePath;
		a.click();
	}
</script>

<style lang="less" scoped>
	@import url('appointment_list.less');
</style>